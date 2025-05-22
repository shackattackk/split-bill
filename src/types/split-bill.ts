export interface TransactionItem {
  id: number;
  name: string;
  price: number;
}

export interface Transaction {
  id: string;
  restaurant: string;
  date: string;
  tax: number;
  tip: number;
  items: TransactionItem[];
}

export interface Person {
  id: number;
  name: string;
  items: number[];
}

export interface SelectedItems {
  [key: number]: number[];
} 