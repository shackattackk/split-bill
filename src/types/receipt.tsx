export interface ReceiptItem {
  name: string | null;
  price: number | null;
}

export interface Receipt {
  restaurant: string | null;
  date: string | null;
  time: string | null;
  items: ReceiptItem[] | null;
  subtotal: number | null;
  tax: number | null;
  tip: number | null;
  total: number | null;
}
