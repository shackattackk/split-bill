"use client";

import { useState } from "react";
import { Transaction, TransactionItem, Person } from "@/types/split-bill";
import { Header } from "@/components/split-bill/header";
import { BillInfo } from "@/components/split-bill/bill-info";
import { PeopleManagement } from "@/components/split-bill/people-management";
import { ItemSelection } from "@/components/split-bill/item-selection";
import { Summary } from "@/components/split-bill/summary";

interface SplitBillClientProps {
  transaction: Transaction;
}

export default function SplitBillClient({ transaction }: SplitBillClientProps) {
  const [people, setPeople] = useState<Person[]>([]);
  const [selectedItems, setSelectedItems] = useState<Record<number, number[]>>({});
  const [editingItem, setEditingItem] = useState<TransactionItem | null>(null);
  const [editedItems, setEditedItems] = useState<TransactionItem[]>(transaction.items);

  const addPerson = (name: string) => {
    setPeople([
      ...people,
      {
        id: people.length + 1,
        name,
        items: [],
      },
    ]);
  };

  const toggleItem = (personId: number, itemId: number) => {
    setSelectedItems((prev) => {
      const personItems = prev[personId] || [];
      const newItems = personItems.includes(itemId)
        ? personItems.filter((id) => id !== itemId)
        : [...personItems, itemId];
      return { ...prev, [personId]: newItems };
    });
  };

  const handleEditItem = (item: TransactionItem) => {
    setEditingItem(item);
  };

  const handleSaveEdit = (itemId: number, newName: string, newPrice: number) => {
    setEditedItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, name: newName, price: newPrice } : item
      )
    );
    setEditingItem(null);
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
