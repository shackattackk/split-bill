import { UserPlus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Person, Transaction, TransactionItem } from "@/types/split-bill";

interface SummaryProps {
  people: Person[];
  selectedItems: Record<number, number[]>;
  transaction: Transaction;
  items: TransactionItem[];
}

export function Summary({
  people,
  selectedItems,
  transaction,
  items,
}: SummaryProps) {
  const calculateSubtotal = (personId: number) => {
    const personItems = selectedItems[personId] || [];
    return personItems.reduce((total, itemId) => {
      const item = items.find((i) => i.id === itemId);
      const sharingCount = people.filter((p) =>
        selectedItems[p.id]?.includes(itemId)
      ).length;
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

  const isItemShared = (itemId: number) => {
    return people.filter((p) => selectedItems[p.id]?.includes(itemId)).length > 1;
  };

  return (
    <Card className="bg-slate-800/80 border border-slate-700/50 rounded-xl shadow-lg shadow-blue-500/5">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-white text-lg">
          <UserPlus className="h-5 w-5 text-blue-400" /> Summary
        </CardTitle>
      </CardHeader>
      <CardContent>
        {people.length === 0 ? (
          <div className="text-slate-400 text-sm mb-2">
            Add people to see your share
          </div>
        ) : (
          <div className="text-white font-semibold mb-2">Payment Summary</div>
        )}
        <div className="space-y-3">
          {people.map((person) => (
            <div
              key={person.id}
              className="bg-slate-900/60 border border-slate-700/50 rounded-lg p-3 hover:bg-slate-900/80 transition-all duration-300"
            >
              <div className="flex items-center gap-2 mb-1">
                <UserPlus className="h-4 w-4 text-blue-400" />
                <span className="font-bold text-blue-400">{person.name}</span>
                <span className="ml-auto text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-blue-400 font-semibold text-base sm:text-lg">
                  ${(calculateSubtotal(person.id) + calculateTaxTip(person.id)).toFixed(2)}
                </span>
              </div>
              <div className="text-xs text-slate-400">
                Subtotal:{" "}
                <span className="text-slate-200">
                  ${calculateSubtotal(person.id).toFixed(2)}
                </span>
              </div>
              <div className="text-xs text-slate-400">
                Tax + Tip:{" "}
                <span className="text-slate-200">
                  ${calculateTaxTip(person.id).toFixed(2)}
                </span>
              </div>
              <div className="text-xs text-slate-500 mt-1">
                {selectedItems[person.id]?.length || 0} items selected
                {selectedItems[person.id]?.some((itemId) =>
                  isItemShared(itemId)
                ) && (
                  <span className="text-blue-400 ml-1">
                    (including shared items)
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 