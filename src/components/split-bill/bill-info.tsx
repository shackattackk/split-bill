import { Utensils, DollarSign, Pencil } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Transaction } from "@/types/split-bill";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface BillInfoProps {
  transaction: Transaction;
  onUpdate?: (updates: { tax?: number; tip?: number }) => void;
}

export function BillInfo({ transaction, onUpdate }: BillInfoProps) {
  const [editingTax, setEditingTax] = useState(false);
  const [editingTip, setEditingTip] = useState(false);

  return (
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
            <div className="text-lg font-semibold text-slate-200">
              $
              {(
                transaction.items.reduce((sum, item) => sum + item.price, 0) +
                transaction.tax +
                transaction.tip
              ).toFixed(2)}
            </div>
          </div>
          <div className="bg-slate-900/60 rounded-lg p-3 hover:bg-slate-900/80 transition-colors">
            <div className="text-xs text-slate-400 mb-1 flex items-center gap-1">
              <DollarSign className="h-4 w-4 text-blue-400" /> Tax
            </div>
            <div className="flex items-center gap-2">
              {editingTax ? (
                <Input
                  type="number"
                  value={transaction.tax}
                  onChange={(e) => onUpdate?.({ tax: parseFloat(e.target.value) || 0 })}
                  onBlur={() => setEditingTax(false)}
                  autoFocus
                  className="bg-transparent border-0 p-0 h-auto text-lg font-semibold text-slate-200 focus:ring-0 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  step="0.01"
                />
              ) : (
                <>
                  <div className="text-lg font-semibold text-slate-200">
                    ${transaction.tax.toFixed(2)}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-slate-400 hover:text-slate-100 hover:bg-slate-700/50"
                    onClick={() => setEditingTax(true)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </div>
          <div className="bg-slate-900/60 rounded-lg p-3 hover:bg-slate-900/80 transition-colors">
            <div className="text-xs text-slate-400 mb-1 flex items-center gap-1">
              <DollarSign className="h-4 w-4 text-blue-400" /> Tip
            </div>
            <div className="flex items-center gap-2">
              {editingTip ? (
                <Input
                  type="number"
                  value={transaction.tip}
                  onChange={(e) => onUpdate?.({ tip: parseFloat(e.target.value) || 0 })}
                  onBlur={() => setEditingTip(false)}
                  autoFocus
                  className="bg-transparent border-0 p-0 h-auto text-lg font-semibold text-slate-200 focus:ring-0 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  step="0.01"
                />
              ) : (
                <>
                  <div className="text-lg font-semibold text-slate-200">
                    ${transaction.tip.toFixed(2)}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-slate-400 hover:text-slate-100 hover:bg-slate-700/50"
                    onClick={() => setEditingTip(true)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 