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

// Mock data for demonstration
const mockItems = [
  { id: 1, name: "Spaghetti Carbonara", price: 16.99 },
  { id: 2, name: "Margherita Pizza", price: 14.99 },
  { id: 3, name: "Caesar Salad", price: 9.99 },
  { id: 4, name: "Garlic Bread", price: 5.99 },
  { id: 5, name: "Tiramisu", price: 7.99 },
  { id: 6, name: "Sparkling Water", price: 3.99 },
  { id: 7, name: "Cappuccino", price: 4.99 },
];

const mockBill = {
  restaurant: "Pasta Palace",
  date: "May 6, 2025",
  tax: 5.39,
  tip: 10.0,
};

interface Person {
  id: number;
  name: string;
  items: number[];
}

interface ItemPortion {
  itemId: number;
  portions: number;
}

export default function SplitBillPage() {
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
      const item = mockItems.find((i) => i.id === itemId);
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
    return share * (mockBill.tax + mockBill.tip);
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
        <div className="container max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="ghost" size="sm" asChild className="text-slate-400 hover:text-slate-100 hover:bg-slate-700/50">
            <Link href="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
          </Button>
          <div className="flex items-center -ml-16">
            <Receipt className="h-5 w-5 text-blue-400 mr-2" />
            <h1 className="text-lg font-semibold text-slate-100">Receipt Splitter</h1>
          </div>
          <div className="w-[88px]"></div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 space-y-8 mt-8">
        <div className="text-center mb-2">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-pink-500 to-yellow-500 mb-2">
            Split Your Bill
          </h1>
          <p className="text-slate-300 text-base">
            Select the items each person consumed and calculate their share
          </p>
        </div>

        {/* Bill Info */}
        <Card className="bg-slate-800/80 border border-slate-700/50 rounded-2xl shadow-lg shadow-blue-500/5 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2 relative">
            <CardTitle className="flex items-center gap-2 text-xl text-white">
              <Utensils className="h-5 w-5 text-blue-400" />
              {mockBill.restaurant}
            </CardTitle>
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
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-900/60 rounded-lg p-4 hover:bg-slate-900/80 transition-colors">
                <div className="text-xs text-slate-400 mb-1 flex items-center gap-1">
                  <Calendar className="h-4 w-4 text-blue-400" /> Date
                </div>
                <div className="text-lg font-semibold text-white">
                  {mockBill.date}
                </div>
              </div>
              <div className="bg-slate-900/60 rounded-lg p-4 hover:bg-slate-900/80 transition-colors">
                <div className="text-xs text-slate-400 mb-1 flex items-center gap-1">
                  <DollarSign className="h-4 w-4 text-blue-400" /> Tax
                </div>
                <div className="text-lg font-semibold text-white">
                  ${mockBill.tax.toFixed(2)}
                </div>
              </div>
              <div className="bg-slate-900/60 rounded-lg p-4 hover:bg-slate-900/80 transition-colors">
                <div className="text-xs text-slate-400 mb-1 flex items-center gap-1">
                  <DollarSign className="h-4 w-4 text-blue-400" /> Tip
                </div>
                <div className="text-lg font-semibold text-white">
                  ${mockBill.tip.toFixed(2)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* People Section */}
        <Card className="bg-slate-800/80 border border-slate-700/50 rounded-2xl shadow-lg shadow-blue-500/5 transition-all duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-white text-lg">
              <UserPlus className="h-5 w-5 text-blue-400" /> People
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 mb-4">
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
                  className="flex items-center gap-2 bg-slate-900/60 border border-slate-700/50 rounded-lg px-4 py-2 text-white hover:bg-slate-900/80 transition-colors"
                >
                  <UserPlus className="h-4 w-4 text-blue-400" />
                  <span>{person.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Select Items Section */}
        <Card className="bg-slate-800/80 border border-slate-700/50 rounded-2xl shadow-lg shadow-blue-500/5 transition-all duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-white text-lg">
              <Utensils className="h-5 w-5 text-blue-400" /> Select Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr className="text-slate-400 border-b border-slate-700/50">
                    <th className="py-3 font-medium">Item</th>
                    <th className="py-3 font-medium">Price</th>
                    {people.map((person) => (
                      <th
                        key={person.id}
                        className="py-3 font-medium text-center"
                      >
                        {person.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {mockItems.map((item) => (
                    <tr
                      key={item.id}
                      className={`border-b border-slate-800/50 hover:bg-slate-700/30 transition-colors ${
                        isItemShared(item.id) ? 'bg-blue-500/5' : ''
                      }`}
                    >
                      <td className="py-3 flex items-center gap-2">
                        <span className="text-white font-medium">{item.name}</span>
                        {isItemShared(item.id) && (
                          <span className="text-xs text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full">
                            Shared ({getSharingCount(item.id)})
                          </span>
                        )}
                      </td>
                      <td className="py-3 text-white">
                        ${item.price.toFixed(2)}
                      </td>
                      {people.map((person) => (
                        <td key={person.id} className="py-3 text-center">
                          <button
                            className={`inline-flex items-center justify-center w-6 h-6 rounded-full border-2 transition-all duration-200 cursor-pointer ${
                              selectedItems[person.id]?.includes(item.id)
                                ? "border-blue-500 bg-blue-600 hover:bg-blue-500"
                                : "border-slate-600 bg-transparent hover:border-blue-400 hover:bg-slate-700/50"
                            }`}
                            onClick={() => toggleItem(person.id, item.id)}
                          >
                            <Check 
                              className={`h-4 w-4 transition-all duration-200 ${
                                selectedItems[person.id]?.includes(item.id)
                                  ? "text-white opacity-100 scale-100"
                                  : "opacity-0 scale-75"
                              }`}
                            />
                          </button>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Summary Section */}
        <Card className="bg-slate-800/80 border border-slate-700/50 rounded-2xl shadow-lg shadow-blue-500/5 transition-all duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-white text-lg">
              <DollarSign className="h-5 w-5 text-blue-400" /> Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-white font-semibold mb-2">Payment Summary</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {people.map((person) => (
                <div
                  key={person.id}
                  className="bg-slate-900/60 border border-slate-700/50 rounded-lg p-4 hover:bg-slate-900/80 transition-all duration-300"
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
                  <div className="text-xs text-slate-400 mb-1">
                    Subtotal:{" "}
                    <span className="text-white">
                      ${calculateSubtotal(person.id).toFixed(2)}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 mb-1">
                    Tax + Tip:{" "}
                    <span className="text-white">
                      ${calculateTaxTip(person.id).toFixed(2)}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-2">
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
      </main>
      <footer className="text-center text-xs text-slate-500 mt-8 pt-8 border-t border-slate-800/50">
        © 2025 Receipt Splitter. All rights reserved.
      </footer>
    </div>
  );
}
