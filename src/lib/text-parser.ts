import { Receipt, ReceiptItem } from "@/types/receipt";

export function parseText(text: string): Receipt {
  const receipt: Receipt = {
    restaurant: null,
    date: null,
    time: null,
    items: null,
    subtotal: null,
    tax: null,
    tip: null,
    total: null,
  };

  let isItemsSection = false;
  const items: ReceiptItem[] = [];
  
  const lines = text.split("\n").map((line) => line.trim());
  for (const line of lines) {
    if (line.startsWith("RESTAURANT:")) {
      receipt.restaurant = line.split(": ")[1].trim();
    } else if (line.startsWith("DATE:")) {
      receipt.date = line.split(": ")[1].trim();
    } else if (line.startsWith("TIME:")) {
      receipt.time = line.split(": ")[1].trim();
    } else if (line.startsWith("ITEMS:")) {
      isItemsSection = true;
      continue;
    } else if (line.startsWith("END_ITEMS")) {
      isItemsSection = false;
      continue;
    } else if (line.startsWith("SUBTOTAL:")) {
      receipt.subtotal = parseFloat(line.split(": ")[1].trim().replace("$", ""));
    } else if (line.startsWith("TAX:")) {
      receipt.tax = parseFloat(line.split(": ")[1].trim().replace("$", ""));
    } else if (line.startsWith("TIP:")) {
      receipt.tip = parseFloat(line.split(": ")[1].trim().replace("$", ""));
    } else if (line.startsWith("TOTAL:")) {
      receipt.total = parseFloat(line.split(": ")[1].trim().replace("$", ""));
    }
    if (isItemsSection) {
      const [name, price] = line.split("|");
      const item: ReceiptItem = {
        name: name.trim(),
        price: parseFloat(price.trim().replace("$", "")),
      };
      items.push(item);
    }
  }
  receipt.items = items;
  return receipt;
}
