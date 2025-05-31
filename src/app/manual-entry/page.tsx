"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Plus,
  ArrowLeft,
  Save,
  UserPlus,
  X,
  Utensils,
  DollarSign,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Header } from "@/components/split-bill/header";

interface BillItem {
  name: string;
  price: number;
}

interface Participant {
  name: string;
}

export default function ManualEntryPage() {
  const router = useRouter();
  const [restaurant, setRestaurant] = useState("");
  const [tax, setTax] = useState("");
  const [tip, setTip] = useState("");
  const [items, setItems] = useState<BillItem[]>([{ name: "", price: 0 }]);
  const [participants, setParticipants] = useState<Participant[]>([
    { name: "" },
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const addItem = () => {
    setItems([...items, { name: "", price: 0 }]);
  };

  const addParticipant = () => {
    setParticipants([...participants, { name: "" }]);
  };

  const updateItem = (
    index: number,
    field: keyof BillItem,
    value: string | number
  ) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const updateParticipant = (index: number, name: string) => {
    const newParticipants = [...participants];
    newParticipants[index] = { ...newParticipants[index], name };
    setParticipants(newParticipants);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const removeParticipant = (index: number) => {
    if (participants.length > 1) {
      setParticipants(participants.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async () => {
    if (!restaurant) {
      alert("Please enter a restaurant name");
      return;
    }

    if (items.some((item) => !item.name || item.price <= 0)) {
      alert("Please fill in all items with valid prices");
      return;
    }

    if (participants.some((p) => !p.name)) {
      alert("Please fill in all participant names");
      return;
    }

    setIsLoading(true);
    try {
      // Create transaction
      const { data: transaction, error: transactionError } = await supabase
        .from("transactions")
        .insert({
          restaurant,
          tax: parseFloat(tax) || 0,
          tip: parseFloat(tip) || 0,
        })
        .select()
        .single();

      if (transactionError) throw transactionError;

      // Create line items
      const { error: itemsError } = await supabase.from("line_items").insert(
        items.map((item) => ({
          transaction_id: transaction.id,
          description: item.name,
          amount: item.price.toString(),
        }))
      );

      if (itemsError) throw itemsError;

      // Create participants
      const { error: participantsError } = await supabase
        .from("participants")
        .insert(
          participants.map((participant) => ({
            transaction_id: transaction.id,
            name: participant.name,
          }))
        );

      if (participantsError) throw participantsError;

      router.push(`/split/${transaction.id}`);
    } catch (error) {
      console.error("Error creating bill:", error);
      alert("Failed to create bill. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const totalAmount =
    items.reduce((sum, item) => sum + item.price, 0) +
    (parseFloat(tax) || 0) +
    (parseFloat(tip) || 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white pb-8">
      <Header />

      <main className="max-w-7xl mx-auto px-4 mt-4">
        <div className="text-center mb-4">
          <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-pink-500 to-yellow-500">
            Enter Bill Details
          </h1>
          <p className="text-slate-300 text-sm">
            Add your restaurant details, participants, and items
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-4">
            <Card className="bg-slate-800/80 border border-slate-700/50 rounded-xl shadow-lg shadow-blue-500/5">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-white text-lg">
                  <Utensils className="h-5 w-5 text-blue-400" />
                  Restaurant Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Input
                    value={restaurant}
                    onChange={(e) => setRestaurant(e.target.value)}
                    placeholder="Enter restaurant name"
                    className="bg-slate-900/60 border border-slate-700/50 text-white placeholder:text-slate-500 rounded-lg focus:border-blue-500/50 focus:ring-blue-500/20 transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-900/60 rounded-lg p-3 hover:bg-slate-900/80 transition-colors">
                    <div className="text-xs text-slate-400 mb-1 flex items-center gap-1">
                      <DollarSign className="h-4 w-4 text-blue-400" /> Tax
                    </div>
                    <Input
                      type="number"
                      value={tax}
                      onChange={(e) => setTax(e.target.value)}
                      placeholder="0.00"
                      className="bg-transparent border-0 p-0 h-auto text-lg font-semibold text-slate-200 focus:ring-0 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      step="0.01"
                    />
                  </div>
                  <div className="bg-slate-900/60 rounded-lg p-3 hover:bg-slate-900/80 transition-colors">
                    <div className="text-xs text-slate-400 mb-1 flex items-center gap-1">
                      <DollarSign className="h-4 w-4 text-blue-400" /> Tip
                    </div>
                    <Input
                      type="number"
                      value={tip}
                      onChange={(e) => setTip(e.target.value)}
                      placeholder="0.00"
                      className="bg-transparent border-0 p-0 h-auto text-lg font-semibold text-slate-200 focus:ring-0 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      step="0.01"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/80 border border-slate-700/50 rounded-xl shadow-lg shadow-blue-500/5">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-white text-lg">
                  <UserPlus className="h-5 w-5 text-blue-400" /> Participants
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {participants.map((participant, index) => (
                    <div key={index} className="flex gap-3">
                      <Input
                        value={participant.name}
                        onChange={(e) =>
                          updateParticipant(index, e.target.value)
                        }
                        placeholder="Person name"
                        className="bg-slate-900/60 border border-slate-700/50 text-white placeholder:text-slate-500 rounded-lg focus:border-blue-500/50 focus:ring-blue-500/20 transition-all"
                      />
                      {participants.length > 1 && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeParticipant(index)}
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    size="sm"
                    onClick={addParticipant}
                    className="bg-blue-600 hover:bg-blue-500 text-white rounded-lg px-4 transition-all duration-200"
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/80 border border-slate-700/50 rounded-xl shadow-lg shadow-blue-500/5">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-white text-lg">
                  <Utensils className="h-5 w-5 text-blue-400" /> Items
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {items.map((item, index) => (
                    <div key={index} className="flex gap-3">
                      <Input
                        value={item.name}
                        onChange={(e) =>
                          updateItem(index, "name", e.target.value)
                        }
                        placeholder="Item name"
                        className="bg-slate-900/60 border border-slate-700/50 text-white placeholder:text-slate-500 rounded-lg focus:border-blue-500/50 focus:ring-blue-500/20 transition-all"
                      />
                      <Input
                        type="number"
                        value={item.price || ""}
                        onChange={(e) =>
                          updateItem(
                            index,
                            "price",
                            parseFloat(e.target.value) || 0
                          )
                        }
                        placeholder="0.00"
                        className="bg-slate-900/60 border border-slate-700/50 text-white placeholder:text-slate-500 rounded-lg focus:border-blue-500/50 focus:ring-blue-500/20 transition-all w-32 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        step="0.01"
                      />
                      {items.length > 1 && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeItem(index)}
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    size="sm"
                    onClick={addItem}
                    className="bg-blue-600 hover:bg-blue-500 text-white rounded-lg px-4 transition-all duration-200"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-20">
              <Card className="bg-slate-800/80 border border-slate-700/50 rounded-xl shadow-lg shadow-blue-500/5">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-white text-lg">
                    <DollarSign className="h-5 w-5 text-blue-400" /> Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="bg-slate-900/60 border border-slate-700/50 rounded-lg p-3">
                      <div className="text-xs text-slate-400 mb-1 flex items-center gap-1">
                        <DollarSign className="h-4 w-4 text-blue-400" /> Total
                      </div>
                      <div className="text-lg font-semibold text-slate-200">
                        ${totalAmount.toFixed(2)}
                      </div>
                    </div>
                    <Button
                      className="w-full justify-start gap-3 text-base py-6 hover:text-slate-100 cursor-pointer bg-blue-600 hover:bg-blue-500 text-white rounded-lg px-4 transition-all duration-200"
                      onClick={handleSubmit}
                      disabled={isLoading}
                    >
                      <Save className="h-5 w-5 text-white" />
                      {isLoading ? "Creating..." : "Create Bill"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
