import React, { useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from "react-native";

export interface QuickAmountPickerProps {
  amounts: string[];
  selectedAmount?: string;
  onAmountSelect: (amount: string) => void;
  style?: ViewStyle;
}

export default function QuickAmountPicker({
  amounts,
  selectedAmount,
  onAmountSelect,
  style,
}: QuickAmountPickerProps) {
  const handleAmountSelect = useCallback(
    (amount: string) => () => {
      onAmountSelect(amount);
    },
    [onAmountSelect]
  );

  return (
    <View style={[styles.container, style]}>
      {amounts.map((amount, index) => (
        <TouchableOpacity
          key={index}
          style={[
            styles.amountButton,
            selectedAmount === amount && styles.selectedButton,
          ]}
          onPress={handleAmountSelect(amount)}
        >
          <Text
            style={[
              styles.amountText,
              selectedAmount === amount && styles.selectedText,
            ]}
          >
            {amount}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: 12,
    flexWrap: "wrap",
  },
  amountButton: {
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    minWidth: 60,
    alignItems: "center",
  },
  selectedButton: {
    backgroundColor: "#007AFF",
  },
  amountText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
  selectedText: {
    color: "#fff",
  },
});
