import { SFSymbol } from "expo-symbols";

export type Category = {
  id: string;
  name: string;
  icon?: string;
  color?: string;
  subcategories?: Subcategory[];
};

export type Subcategory = {
  id: string;
  name: string;
  icon?: SFSymbol;
};
