export type AccountData = {
  id: string;
  name: string;
  balance: number;
  icon: string;
};

export type AccountType =
  | "CHECKING"
  | "SAVINGS"
  | "CREDIT_CARD"
  | "INVESTMENT"
  | "LOAN";
