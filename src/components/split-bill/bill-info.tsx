import { Utensils, DollarSign } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Transaction } from "@/types/split-bill";

interface BillInfoProps {
  transaction: Transaction;
}

export function BillInfo({ transaction }: BillInfoProps) {
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
            <div className="text-lg font-semibold text-slate-200">
              ${transaction.tax.toFixed(2)}
            </div>
          </div>
          <div className="bg-slate-900/60 rounded-lg p-3 hover:bg-slate-900/80 transition-colors">
            <div className="text-xs text-slate-400 mb-1 flex items-center gap-1">
              <DollarSign className="h-4 w-4 text-blue-400" /> Tip
            </div>
            <div className="text-lg font-semibold text-slate-200">
              ${transaction.tip.toFixed(2)}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 