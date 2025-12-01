import { useCallback } from "react";
import { ViewStyle } from "react-native";

import { QuickPicker } from "./ui/QuickPicker";

export interface QuickAmountPickerProps {
  amounts: number[];
  selectedAmount?: number;
  onAmountSelect: (amount: number) => void;
  style?: ViewStyle;
}

const currencyIcon = "$";

export default function QuickAmountPicker({
  amounts,
  selectedAmount,
  onAmountSelect,
  style,
}: QuickAmountPickerProps) {
  const handleAmountSelect = useCallback(
    (amount: string) => {
      onAmountSelect(parseFloat(amount.replace(currencyIcon, "")));
    },
    [onAmountSelect],
  );

  const amountsItems = amounts.map((amount) => `${currencyIcon}${amount}`);

  return (
    <QuickPicker
      items={amountsItems}
      selectedItem={selectedAmount?.toString()}
      onItemSelect={handleAmountSelect}
      style={style}
    />
  );
}
