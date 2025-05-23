"use client";

import { useState, useEffect } from "react";
import { Transaction, TransactionItem, Person } from "@/types/split-bill";
import { Header } from "@/components/split-bill/header";
import { BillInfo } from "@/components/split-bill/bill-info";
import { PeopleManagement } from "@/components/split-bill/people-management";
import { ItemSelection } from "@/components/split-bill/item-selection";
import { Summary } from "@/components/split-bill/summary";
import { supabase } from "@/lib/supabase";
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

interface SplitBillClientProps {
  transaction: Transaction;
}

interface ParticipantItemPayload {
  participantId: number;
  lineItemId: number;
  isSelected: boolean;
}

export default function SplitBillClient({ transaction }: SplitBillClientProps) {
  const [people, setPeople] = useState<Person[]>(transaction.participants || []);
  const [selectedItems, setSelectedItems] = useState<Record<number, number[]>>(() => {
    // Initialize selectedItems from the participants' items
    const initialSelectedItems: Record<number, number[]> = {};
    transaction.participants.forEach(participant => {
      initialSelectedItems[participant.id] = participant.items;
    });
    return initialSelectedItems;
  });
  const [editingItem, setEditingItem] = useState<TransactionItem | null>(null);
  const [editedItems, setEditedItems] = useState<TransactionItem[]>(transaction.items);

  // Subscribe to line items changes
  useEffect(() => {
    const channel = supabase
      .channel('line_items_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'line_items',
          filter: `transaction_id=eq.${transaction.id}`,
        },
        (payload: RealtimePostgresChangesPayload<TransactionItem>) => {
          console.log('Line items update:', payload);
          
          if (payload.eventType === 'INSERT') {
            const newItem = payload.new;
            setEditedItems((current) => [...current, newItem]);
          } else if (payload.eventType === 'UPDATE') {
            const updatedItem = payload.new;
            setEditedItems((current) =>
              current.map((item) =>
                item.id === updatedItem.id ? updatedItem : item
              )
            );
          } else if (payload.eventType === 'DELETE') {
            const deletedItem = payload.old;
            setEditedItems((current) =>
              current.filter((item) => item.id !== deletedItem.id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [transaction.id]);

  // Subscribe to participants changes
  useEffect(() => {
    const channel = supabase
      .channel('participants_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'participants',
          filter: `transaction_id=eq.${transaction.id}`,
        },
        (payload: RealtimePostgresChangesPayload<Person>) => {
          console.log('Participants update:', payload);
          
          if (payload.eventType === 'INSERT') {
            const newPerson = payload.new;
            setPeople((current) => [...current, { ...newPerson, items: [] }]);
          } else if (payload.eventType === 'UPDATE') {
            const updatedPerson = payload.new;
            setPeople((current) =>
              current.map((person) =>
                person.id === updatedPerson.id 
                  ? { ...updatedPerson, items: person.items } 
                  : person
              )
            );
          } else if (payload.eventType === 'DELETE') {
            const deletedPerson = payload.old;
            setPeople((current) =>
              current.filter((person) => person.id !== deletedPerson.id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [transaction.id]);

  // Subscribe to participant items changes
  useEffect(() => {
    if (people.length === 0) return;

    const channel = supabase
      .channel('participant_items_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'participant_items',
          filter: `participant_id=in.(${people.map(p => p.id).join(',')})`,
        },
        (payload: RealtimePostgresChangesPayload<ParticipantItemPayload>) => {
          console.log('Participant items update:', payload);
          
          if (payload.eventType === 'INSERT' && payload.new.isSelected) {
            const participantId = payload.new.participantId;
            if (typeof participantId === 'number') {
              setSelectedItems((current) => {
                const personItems = current[participantId] || [];
                return {
                  ...current,
                  [participantId]: [...personItems, payload.new.lineItemId],
                };
              });
            }
          } else if (payload.eventType === 'DELETE' || (payload.eventType === 'UPDATE' && !payload.new.isSelected)) {
            const participantId = payload.old.participantId;
            if (typeof participantId === 'number') {
              setSelectedItems((current) => {
                const personItems = current[participantId] || [];
                return {
                  ...current,
                  [participantId]: personItems.filter((id: number) => id !== payload.old.lineItemId),
                };
              });
            }
          }
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [people]);

  const addPerson = async (name: string) => {
    try {
      const { error } = await supabase
        .from('participants')
        .insert({
          transaction_id: transaction.id,
          name,
        });

      if (error) throw error;
    } catch (err) {
      console.error('Error adding person:', err);
    }
  };

  const toggleItem = async (personId: number, itemId: number) => {
    try {
      const isCurrentlySelected = selectedItems[personId]?.includes(itemId);
      
      if (isCurrentlySelected) {
        // Remove the selection
        const { error } = await supabase
          .from('participant_items')
          .delete()
          .match({ participant_id: personId, line_item_id: itemId });
        
        if (error) throw error;
      } else {
        // Add the selection
        const { error } = await supabase
          .from('participant_items')
          .insert({
            participant_id: personId,
            line_item_id: itemId,
            is_selected: true,
          });
        
        if (error) throw error;
      }

      // Update local state
      setSelectedItems((prev) => {
        const personItems = prev[personId] || [];
        const newItems = isCurrentlySelected
          ? personItems.filter((id) => id !== itemId)
          : [...personItems, itemId];
        return { ...prev, [personId]: newItems };
      });
    } catch (err) {
      console.error('Error toggling item:', err);
    }
  };

  const handleEditItem = (item: TransactionItem) => {
    setEditingItem(item);
  };

  const handleSaveEdit = async (itemId: number, newName: string, newPrice: number) => {
    try {
      const { error } = await supabase
        .from('line_items')
        .update({ 
          description: newName, 
          amount: newPrice.toString() 
        })
        .eq('id', itemId);

      if (error) throw error;
      setEditingItem(null);
    } catch (err) {
      console.error('Error updating item:', err);
    }
  };

  const handleCancelEdit = () => {
    setEditingItem(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white pb-8">
      <Header />

      <main className="max-w-7xl mx-auto px-4 mt-4">
        <div className="text-center mb-4">
          <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-pink-500 to-yellow-500">
            Split Your Bill
          </h1>
          <p className="text-slate-300 text-sm">
            Select the items each person consumed and calculate their share
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-4">
            <BillInfo transaction={transaction} />
            <PeopleManagement people={people} onAddPerson={addPerson} />
            <ItemSelection
              items={editedItems}
              people={people}
              selectedItems={selectedItems}
              onToggleItem={toggleItem}
              onEditItem={handleEditItem}
              onSaveEdit={handleSaveEdit}
              onCancelEdit={handleCancelEdit}
              editingItem={editingItem}
            />
          </div>

          {/* Right Column - Sticky Summary */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-20">
              <Summary
                people={people}
                selectedItems={selectedItems}
                transaction={transaction}
                items={editedItems}
              />
            </div>
          </div>
        </div>
      </main>
      <footer className="text-center text-xs text-slate-500 mt-8 pt-8 border-t border-slate-800/50">
        © 2025 Split Party. All rights reserved.
      </footer>
    </div>
  );
}
