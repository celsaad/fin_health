import { useCallback } from "react";
import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  ViewStyle,
} from "react-native";

export interface QuickPickerProps {
  items: string[];
  selectedItem?: string;
  onItemSelect: (item: string) => void;
  style?: ViewStyle;
}

export function QuickPicker({
  items,
  selectedItem,
  onItemSelect,
  style,
}: QuickPickerProps) {
  const handleItemSelect = useCallback(
    (item: string) => () => {
      onItemSelect(item);
    },
    [onItemSelect],
  );

  return (
    <View style={[styles.container, style]}>
      {items.map((item, index) => (
        <TouchableOpacity
          key={index}
          style={[
            styles.itemButton,
            selectedItem === item && styles.selectedButton,
          ]}
          onPress={handleItemSelect(item)}
        >
          <Text
            style={[
              styles.itemText,
              selectedItem === item && styles.selectedText,
            ]}
          >
            {item}
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
  itemButton: {
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
  itemText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
  selectedText: {
    color: "#fff",
  },
});
