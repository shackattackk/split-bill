"use client";

import { useState } from "react";
import { Transaction, TransactionItem } from "@/types/split-bill";
import { Header } from "@/components/split-bill/header";
import { BillInfo } from "@/components/split-bill/bill-info";
import { PeopleManagement } from "@/components/split-bill/people-management";
import { ItemSelection } from "@/components/split-bill/item-selection";
import { Summary } from "@/components/split-bill/summary";
import { supabase } from "@/lib/supabase";
import { useSplitBillSubscriptions } from "@/hooks/use-split-bill-subscription";

interface SplitBillClientProps {
  transaction: Transaction;
}

export default function SplitBillClient({
  transaction: initialTransaction,
}: SplitBillClientProps) {
  const [transaction, setTransaction] = useState(initialTransaction);
  const { people, editedItems, selectedItems, setSelectedItems } =
    useSplitBillSubscriptions(
      initialTransaction.id,
      initialTransaction.participants,
      initialTransaction.items
    );

  const [editingItem, setEditingItem] = useState<TransactionItem | null>(null);
  const [isToggling, setIsToggling] = useState(false);

  const addPerson = async (name: string) => {
    try {
      const { error } = await supabase.from("participants").insert({
        transaction_id: transaction.id,
        name,
      });

      if (error) throw error;
    } catch (err) {
      console.error("Error adding person:", err);
    }
  };

  const addItem = async (name: string, price: number) => {
    try {
      const { error } = await supabase.from("line_items").insert({
        transaction_id: transaction.id,
        description: name,
        amount: price,
      });

      if (error) throw error;
    } catch (err) {
      console.error("Error adding item:", err);
    }
  };

  const toggleItem = async (personId: number, itemId: number) => {
    if (isToggling) return; 

    setIsToggling(true);
    const isCurrentlySelected = selectedItems[personId]?.includes(itemId);

    setSelectedItems((prev) => {
      const personItems = prev[personId] || [];
      const newItems = isCurrentlySelected
        ? personItems.filter((id) => id !== itemId)
        : [...personItems, itemId];
      return { ...prev, [personId]: newItems };
    });

    try {
      if (isCurrentlySelected) {
        const { error } = await supabase
          .from("participant_items")
          .update({ is_selected: false })
          .match({ participant_id: personId, line_item_id: itemId });

        if (error) throw error;
      } else {
        const { error } = await supabase.from("participant_items").insert({
          participant_id: personId,
          line_item_id: itemId,
          is_selected: true,
        });

        if (error) throw error;
      }
    } catch (err) {
      setSelectedItems((prev) => {
        const personItems = prev[personId] || [];
        const newItems = isCurrentlySelected
          ? [...personItems, itemId]
          : personItems.filter((id) => id !== itemId);
        return { ...prev, [personId]: newItems };
      });
      console.error("Error toggling item:", err);
    } finally {
      setIsToggling(false);
    }
  };

  const handleEditItem = (item: TransactionItem) => {
    setEditingItem(item);
  };

  const handleSaveEdit = async (
    itemId: number,
    newName: string,
    newPrice: number
  ) => {
    try {
      const { error } = await supabase
        .from("line_items")
        .update({
          description: newName,
          amount: newPrice.toString(),
        })
        .eq("id", itemId);

      if (error) throw error;
      setEditingItem(null);
    } catch (err) {
      console.error("Error updating item:", err);
    }
  };

  const handleCancelEdit = () => {
    setEditingItem(null);
  };

  const handleUpdateTaxTip = async (updates: {
    tax?: number;
    tip?: number;
  }) => {
    try {
      const { error } = await supabase
        .from("transactions")
        .update({
          tax: updates.tax?.toString(),
          tip: updates.tip?.toString(),
        })
        .eq("id", transaction.id);

      if (error) throw error;

      setTransaction((prev) => ({
        ...prev,
        tax: updates.tax ?? prev.tax,
        tip: updates.tip ?? prev.tip,
      }));
    } catch (err) {
      console.error("Error updating tax/tip:", err);
    }
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
          <div className="lg:col-span-2 space-y-4">
            <BillInfo transaction={transaction} onUpdate={handleUpdateTaxTip} />
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
              onAddItem={addItem}
            />
          </div>

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
        © 2025 Snapplit. All rights reserved.
      </footer>
    </div>
  );
}
