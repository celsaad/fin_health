import { AccountData } from "./account";
import { Category, Subcategory } from "./category";

export type TransactionData = {
  id?: string | number;
  name: string;
  category: Category;
  subcategory?: Subcategory | null;
  account: AccountData;
  amount: number;
  color?: string;
  notes?: string;
  date?: string;
  hasNote?: boolean;
};
