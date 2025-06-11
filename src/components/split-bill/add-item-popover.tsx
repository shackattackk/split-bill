import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface AddItemPopoverProps {
  onAddItem: (name: string, price: number) => void;
}

export function AddItemPopover({ onAddItem }: AddItemPopoverProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");

  const handleSubmit = () => {
    if (name.trim() && price) {
      onAddItem(name.trim(), parseFloat(price));
      setName("");
      setPrice("");
      setOpen(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-500 text-white rounded-lg px-4 transition-all duration-200">
          <Plus className="h-4 w-4 mr-2" />
          Add Item
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 bg-slate-800/95 border-slate-700/50 text-white">
        <div className="space-y-4">
          <div className="space-y-2">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Item name"
              className="bg-slate-900/60 border-slate-700/50 text-white placeholder:text-slate-500 rounded-lg focus:border-blue-500/50 focus:ring-blue-500/20 transition-all"
            />
            <Input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Price"
              className="bg-slate-900/60 border-slate-700/50 text-white placeholder:text-slate-500 rounded-lg focus:border-blue-500/50 focus:ring-blue-500/20 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              step="0.01"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              onClick={() => setOpen(false)}
              className="text-slate-400 hover:text-slate-300 hover:bg-slate-700/50"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!name.trim() || !price}
              className="bg-blue-600 hover:bg-blue-500 text-white"
            >
              Add Item
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
} 