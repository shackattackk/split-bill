interface ReceiptItem {
  name: string | null;
  price: number | null;
}

interface Receipt {
  restaurant: string | null;
  date: string | null;
  time: string | null;
  items: ReceiptItem[] | null;
  subtotal: number | null;
  tax: number | null;
  tip: number | null;
  total: number | null;
}

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
  let items: ReceiptItem[] = [];
  
  const lines = text.split("\n").map((line) => line.trim());
  for (const line of lines) {
    if (line.startsWith("RESTAURANT:")) {
      const [_, restaurant] = line.split(": ");
      receipt.restaurant = restaurant.trim();
    } else if (line.startsWith("DATE:")) {
      const [_, date] = line.split(": ");
      receipt.date = date.trim();
    } else if (line.startsWith("TIME:")) {
      const [_, time] = line.split(": ");
      receipt.time = time.trim();
    } else if (line.startsWith("ITEMS:")) {
      isItemsSection = true;
      continue;
    } else if (line.startsWith("END_ITEMS")) {
      isItemsSection = false;
      continue;
    } else if (line.startsWith("SUBTOTAL:")) {
      const [_, subtotal] = line.split(": ");
      receipt.subtotal = parseFloat(subtotal.trim().replace("$", ""));
    } else if (line.startsWith("TAX:")) {
      const [_, tax] = line.split(": ");
      receipt.tax = parseFloat(tax.trim().replace("$", ""));
    } else if (line.startsWith("TIP:")) {
      const [_, tip] = line.split(": ");
      receipt.tip = parseFloat(tip.trim().replace("$", ""));
    } else if (line.startsWith("TOTAL:")) {
      const [_, total] = line.split(": ");
      receipt.total = parseFloat(total.trim().replace("$", ""));
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
