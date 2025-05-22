import { Utensils, Share2, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Person, TransactionItem } from "@/types/split-bill";
import { useState } from "react";

interface ItemSelectionProps {
  items: TransactionItem[];
  people: Person[];
  selectedItems: Record<number, number[]>;
  onToggleItem: (personId: number, itemId: number) => void;
  onEditItem: (item: TransactionItem) => void;
  onSaveEdit: (itemId: number, newName: string, newPrice: number) => void;
  onCancelEdit: () => void;
  editingItem: TransactionItem | null;
}

export function ItemSelection({
  items,
  people,
  selectedItems,
  onToggleItem,
  onEditItem,
  onSaveEdit,
  onCancelEdit,
  editingItem,
}: ItemSelectionProps) {
  const isItemShared = (itemId: number) => {
    return people.filter((p) => selectedItems[p.id]?.includes(itemId)).length > 1;
  };

  const getSharingCount = (itemId: number) => {
    return people.filter((p) => selectedItems[p.id]?.includes(itemId)).length;
  };

  return (
    <Card className="bg-slate-800/80 border border-slate-700/50 rounded-xl shadow-lg shadow-blue-500/5">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-white text-lg">
          <Utensils className="h-5 w-5 text-blue-400" /> Select Items
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {items.map((item) => (
            <div
              key={item.id}
              className={`bg-slate-900/60 border border-slate-700/50 rounded-lg p-2 hover:bg-slate-900/80 transition-all ${
                isItemShared(item.id)
                  ? "bg-blue-500/5 border-blue-500/20"
                  : ""
              }`}
            >
              {editingItem?.id === item.id ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Input
                      value={editingItem.name}
                      onChange={(e) =>
                        onEditItem({
                          ...editingItem,
                          name: e.target.value,
                        })
                      }
                      className="bg-slate-800 border-slate-700 text-white"
                      placeholder="Item name"
                    />
                    <Input
                      type="number"
                      value={editingItem.price}
                      onChange={(e) =>
                        onEditItem({
                          ...editingItem,
                          price: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="bg-slate-800 border-slate-700 text-white w-24 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      placeholder="Price"
                      step="0.01"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() =>
                        onSaveEdit(
                          item.id,
                          editingItem.name,
                          editingItem.price
                        )
                      }
                      className="bg-blue-600 hover:bg-blue-500 text-white cursor-pointer"
                      size="sm"
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button
                      onClick={onCancelEdit}
                      variant="outline"
                      className="border-pink-500/20 text-pink-400 hover:bg-pink-500/10 hover:text-pink-300 cursor-pointer bg-transparent"
                      size="sm"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-200 font-medium text-sm sm:text-base">
                          {item.name}
                        </span>
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
                    <div className="flex items-center gap-2">
                      <span className="text-slate-200 font-medium text-sm sm:text-base">
                        ${item.price.toFixed(2)}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-400 hover:text-slate-100 hover:bg-slate-700/50 cursor-pointer focus:outline-none focus:ring-0 focus-visible:ring-0 active:bg-slate-700/50"
                        onClick={() => onEditItem(item)}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                        </svg>
                      </Button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {people.map((person) => (
                      <button
                        key={person.id}
                        onClick={() => onToggleItem(person.id, item.id)}
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
                </>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 