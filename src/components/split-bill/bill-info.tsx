import { Utensils, DollarSign } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Transaction } from "@/types/split-bill";
import { Input } from "@/components/ui/input";
import { useState, useMemo } from "react";
import { debounce } from "lodash";

interface BillInfoProps {
  transaction: Transaction;
  onUpdate?: (updates: { tax?: number; tip?: number }) => void;
}

export function BillInfo({ transaction, onUpdate }: BillInfoProps) {
  const [editingTax, setEditingTax] = useState(false);
  const [editingTip, setEditingTip] = useState(false);
  const [tempTax, setTempTax] = useState(transaction.tax);
  const [tempTip, setTempTip] = useState(transaction.tip);

  const debouncedTaxUpdate = useMemo(
    () => debounce((value: number) => onUpdate?.({ tax: value }), 500),
    [onUpdate]
  );
  const debouncedTipUpdate = useMemo(
    () => debounce((value: number) => onUpdate?.({ tip: value }), 500),
    [onUpdate]
  );

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
            <div className="flex items-center min-h-[28px]">
              {editingTax ? (
                <Input
                  type="number"
                  value={tempTax}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value) || 0;
                    setTempTax(value);
                    debouncedTaxUpdate(value);
                  }}
                  onBlur={() => setEditingTax(false)}
                  autoFocus
                  className="bg-transparent border-0 p-0 h-auto text-lg font-semibold text-slate-200 focus:ring-0 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  step="0.01"
                />
              ) : (
                <div 
                  className="text-lg font-semibold text-slate-200 cursor-pointer hover:text-slate-100"
                  onClick={() => setEditingTax(true)}
                >
                  ${tempTax.toFixed(2)}
                </div>
              )}
            </div>
          </div>
          <div className="bg-slate-900/60 rounded-lg p-3 hover:bg-slate-900/80 transition-colors">
            <div className="text-xs text-slate-400 mb-1 flex items-center gap-1">
              <DollarSign className="h-4 w-4 text-blue-400" /> Tip
            </div>
            <div className="flex items-center min-h-[28px]">
              {editingTip ? (
                <Input
                  type="number"
                  value={tempTip}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value) || 0;
                    setTempTip(value);
                    debouncedTipUpdate(value);
                  }}
                  onBlur={() => setEditingTip(false)}
                  autoFocus
                  className="bg-transparent border-0 p-0 h-auto text-lg font-semibold text-slate-200 focus:ring-0 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  step="0.01"
                />
              ) : (
                <div 
                  className="text-lg font-semibold text-slate-200 cursor-pointer hover:text-slate-100"
                  onClick={() => setEditingTip(true)}
                >
                  ${tempTip.toFixed(2)}
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 