"use client";

import { useState } from "react";
import {
  Plus,
  UserPlus,
  Check,
  Share2,
  Utensils,
  Calendar,
  DollarSign,
  ArrowLeft,
  Receipt,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface TransactionItem {
  id: number;
  name: string;
  price: number;
}

interface Transaction {
  id: string;
  restaurant: string;
  date: string;
  tax: number;
  tip: number;
  items: TransactionItem[];
}

interface Person {
  id: number;
  name: string;
  items: number[];
}

interface SplitBillClientProps {
  transaction: Transaction;
}

export default function SplitBillClient({ transaction }: SplitBillClientProps) {
  const router = useRouter();
  const [people, setPeople] = useState<Person[]>([
    { id: 1, name: "You", items: [] },
  ]);
  const [newPersonName, setNewPersonName] = useState("");
  const [selectedItems, setSelectedItems] = useState<Record<number, number[]>>({});
  const [showCopied, setShowCopied] = useState(false);

  const addPerson = () => {
    if (newPersonName.trim()) {
      setPeople([
        ...people,
        {
          id: people.length + 1,
          name: newPersonName.trim(),
          items: [],
        },
      ]);
      setNewPersonName("");
    }
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

  const calculateSubtotal = (personId: number) => {
    const personItems = selectedItems[personId] || [];
    return personItems.reduce((total, itemId) => {
      const item = transaction.items.find((i) => i.id === itemId);
      // Count how many people are sharing this item
      const sharingCount = people.filter(p => 
        selectedItems[p.id]?.includes(itemId)
      ).length;
      // Divide the price by the number of people sharing
      return total + (item?.price || 0) / sharingCount;
    }, 0);
  };

  const calculateTaxTip = (personId: number) => {
    const subtotal = calculateSubtotal(personId);
    const totalSubtotal = people.reduce(
      (sum, p) => sum + calculateSubtotal(p.id),
      0
    );
    if (!totalSubtotal) return 0;
    const share = subtotal / totalSubtotal;
    return share * (transaction.tax + transaction.tip);
  };

  // Helper function to check if an item is being shared
  const isItemShared = (itemId: number) => {
    return people.filter(p => selectedItems[p.id]?.includes(itemId)).length > 1;
  };

  // Helper function to get sharing count for an item
  const getSharingCount = (itemId: number) => {
    return people.filter(p => selectedItems[p.id]?.includes(itemId)).length;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.href);
    setShowCopied(true);
    setTimeout(() => setShowCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white pb-8">
      <header className="w-full border-b border-slate-800/50 bg-slate-900/95 backdrop-blur-sm sticky top-0 z-10">
        <div className="container max-w-7xl mx-auto px-4 py-2 flex items-center justify-between">
          <Button variant="ghost" size="sm" asChild className="text-slate-400 hover:text-slate-100 hover:bg-slate-700/50">
            <Link href="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Link>
          </Button>
          <div className="flex items-center">
            <Receipt className="h-5 w-5 text-blue-400 mr-2" />
            <h1 className="text-lg font-semibold text-slate-100">Split Party</h1>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="text-slate-400 hover:text-slate-100 hover:bg-slate-700/50 cursor-pointer transition-all relative"
            onClick={handleCopy}
          >
            <Share2 className="h-5 w-5" />
            <span className="sr-only">Share</span>
            {showCopied && (
              <div className="absolute -top-8 right-0 bg-slate-800 text-white text-xs px-3 py-1.5 rounded-md shadow-lg border border-slate-700 z-50 whitespace-nowrap">
                Copied to clipboard!
              </div>
            )}
          </Button>
        </div>
      </header>

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
            {/* Bill Info */}
            <Card className="bg-slate-800/80 border border-slate-700/50 rounded-xl shadow-lg shadow-blue-500/5">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg text-white">
                  <Utensils className="h-5 w-5 text-blue-400" />
                  {transaction.restaurant}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-slate-900/60 rounded-lg p-3 hover:bg-slate-900/80 transition-colors">
                    <div className="text-xs text-slate-400 mb-1 flex items-center gap-1">
                      <DollarSign className="h-4 w-4 text-blue-400" /> Total
                    </div>
                    <div className="text-lg font-semibold text-white">
                      ${(transaction.items.reduce((sum, item) => sum + item.price, 0) + transaction.tax + transaction.tip).toFixed(2)}
                    </div>
                  </div>
                  <div className="bg-slate-900/60 rounded-lg p-3 hover:bg-slate-900/80 transition-colors">
                    <div className="text-xs text-slate-400 mb-1 flex items-center gap-1">
                      <DollarSign className="h-4 w-4 text-blue-400" /> Tax
                    </div>
                    <div className="text-lg font-semibold text-white">
                      ${transaction.tax.toFixed(2)}
                    </div>
                  </div>
                  <div className="bg-slate-900/60 rounded-lg p-3 hover:bg-slate-900/80 transition-colors">
                    <div className="text-xs text-slate-400 mb-1 flex items-center gap-1">
                      <DollarSign className="h-4 w-4 text-blue-400" /> Tip
                    </div>
                    <div className="text-lg font-semibold text-white">
                      ${transaction.tip.toFixed(2)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* People Section */}
            <Card className="bg-slate-800/80 border border-slate-700/50 rounded-xl shadow-lg shadow-blue-500/5">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-white text-lg">
                  <UserPlus className="h-5 w-5 text-blue-400" /> People
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 mb-3">
                  <Input
                    value={newPersonName}
                    onChange={(e) => setNewPersonName(e.target.value)}
                    placeholder="Enter name"
                    className="bg-slate-900/60 border border-slate-700/50 text-white placeholder:text-slate-500 rounded-lg focus:border-blue-500/50 focus:ring-blue-500/20 transition-all"
                  />
                  <Button
                    onClick={addPerson}
                    className="bg-blue-600 hover:bg-blue-500 text-white rounded-lg px-4 transition-all duration-200"
                    disabled={!newPersonName.trim()}
                  >
                    <UserPlus className="h-4 w-4 mr-1" /> Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {people.map((person) => (
                    <div
                      key={person.id}
                      className="flex items-center gap-2 bg-slate-900/60 border border-slate-700/50 rounded-lg px-3 py-1.5 text-white hover:bg-slate-900/80 transition-colors"
                    >
                      <UserPlus className="h-4 w-4 text-blue-400" />
                      <span>{person.name}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Select Items Section */}
            <Card className="bg-slate-800/80 border border-slate-700/50 rounded-xl shadow-lg shadow-blue-500/5">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-white text-lg">
                  <Utensils className="h-5 w-5 text-blue-400" /> Select Items
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {transaction.items.map((item) => (
                    <div
                      key={item.id}
                      className={`bg-slate-900/60 border border-slate-700/50 rounded-lg p-2 hover:bg-slate-900/80 transition-all ${
                        isItemShared(item.id) ? 'bg-blue-500/5 border-blue-500/20' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1.5">
                            <span className="text-white font-medium text-sm sm:text-base">{item.name}</span>
                            {isItemShared(item.id) && (
                              <span className="hidden sm:inline text-xs text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full">
                                Shared ({getSharingCount(item.id)})
                              </span>
                            )}
                          </div>
                          {isItemShared(item.id) && (
                            <span className="sm:hidden flex items-center justify-center w-4 h-4 rounded-full bg-blue-500/20 text-blue-400">
                              <Share2 className="h-3 w-3" />
                            </span>
                          )}
                        </div>
                        <span className="text-white font-medium text-sm sm:text-base">
                          ${item.price.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {people.map((person) => (
                          <button
                            key={person.id}
                            onClick={() => toggleItem(person.id, item.id)}
                            className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg border text-xs sm:text-sm transition-all duration-200 cursor-pointer active:scale-95 ${
                              selectedItems[person.id]?.includes(item.id)
                                ? "border-blue-500 bg-blue-500/20 text-blue-400 shadow-sm shadow-blue-500/20"
                                : "border-slate-700 bg-slate-800/50 text-slate-300 hover:bg-slate-700/50 hover:border-slate-600"
                            }`}
                          >
                            <span>{person.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Sticky Summary */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-20">
              <Card className="bg-slate-800/80 border border-slate-700/50 rounded-xl shadow-lg shadow-blue-500/5">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-white text-lg">
                    <DollarSign className="h-5 w-5 text-blue-400" /> Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-white font-semibold mb-2">Payment Summary</div>
                  <div className="space-y-3">
                    {people.map((person) => (
                      <div
                        key={person.id}
                        className="bg-slate-900/60 border border-slate-700/50 rounded-lg p-3 hover:bg-slate-900/80 transition-all duration-300"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <UserPlus className="h-4 w-4 text-blue-400" />
                          <span className="font-bold text-blue-400">
                            {person.name}
                          </span>
                          <span className="ml-auto text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">
                            $
                            {(
                              calculateSubtotal(person.id) +
                              calculateTaxTip(person.id)
                            ).toFixed(2)}
                          </span>
                        </div>
                        <div className="text-xs text-slate-400">
                          Subtotal:{" "}
                          <span className="text-white">
                            ${calculateSubtotal(person.id).toFixed(2)}
                          </span>
                        </div>
                        <div className="text-xs text-slate-400">
                          Tax + Tip:{" "}
                          <span className="text-white">
                            ${calculateTaxTip(person.id).toFixed(2)}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 mt-1">
                          {selectedItems[person.id]?.length || 0} items selected
                          {selectedItems[person.id]?.some(itemId => isItemShared(itemId)) && (
                            <span className="text-blue-400 ml-1">(including shared items)</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
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