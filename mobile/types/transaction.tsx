import { SFSymbol } from "expo-symbols";

import { AccountData } from "./account";
import { Category, Subcategory } from "./category";

export type TransactionData = {
  id?: string | number;
  name: string;
  category: Category;
  subcategory: Subcategory;
  account: AccountData;
  amount: string;
  icon: SFSymbol;
  color: string;
  notes?: string;
  date?: string;
  hasNote?: boolean;
};
