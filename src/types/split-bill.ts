export interface TransactionItem {
  id: number;
  description: string;
  amount: number;
}

export interface Transaction {
  id: string;
  restaurant: string;
  date: string;
  tax: number;
  tip: number;
  items: TransactionItem[];
  participants: Person[];
}

export interface Person {
  id: number;
  name: string;
  items: number[];
}

export interface SelectedItems {
  [key: number]: number[];
} 