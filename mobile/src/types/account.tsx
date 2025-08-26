import { SFSymbol } from "expo-symbols";

export type AccountData = {
  id: string;
  name: string;
  balance: number;
  icon: SFSymbol;
};

export type AccountType =
  | "CHECKING"
  | "SAVINGS"
  | "CREDIT_CARD"
  | "INVESTMENT"
  | "LOAN";
