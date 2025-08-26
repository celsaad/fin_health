import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  TextStyle,
  Modal,
  FlatList,
  Pressable,
  TextInput,
} from "react-native";

import { IconSymbol } from "./IconSymbol";

/**
 * A reusable dropdown component with customizable styling and behavior.
 * Supports selection, search, custom rendering, and various styling variants.
 *
 * @example
 * const items = [
 *   { id: "1", label: "Option 1", value: "option1" },
 *   { id: "2", label: "Option 2", value: "option2" }
 * ];
 *
 * <Dropdown
 *   items={items}
 *   selectedValue="option1"
 *   onSelect={(item) => console.log(item.value)}
 *   placeholder="Select an option"
 * />
 */
export interface DropdownItem {
  id: string;
  label: string;
  value: any;
}

export interface DropdownProps {
  items: DropdownItem[];
  selectedValue?: any;
  onSelect: (item: DropdownItem) => void;
  placeholder?: string;
  disabled?: boolean;
  style?: ViewStyle;
  dropdownStyle?: ViewStyle;
  itemStyle?: ViewStyle;
  textStyle?: TextStyle;
  placeholderStyle?: TextStyle;
  variant?: "default" | "outlined" | "filled";
  size?: "small" | "medium" | "large";
  maxHeight?: number;
  searchable?: boolean;
  renderItem?: (item: DropdownItem, isSelected: boolean) => React.ReactNode;
}

export default function Dropdown({
  items,
  selectedValue,
  onSelect,
  placeholder = "Select an option",
  disabled = false,
  style,
  dropdownStyle,
  itemStyle,
  textStyle,
  placeholderStyle,
  variant = "default",
  size = "medium",
  maxHeight = 300,
  searchable = false,
  renderItem,
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const selectedItem = items.find((item) => item.value === selectedValue);

  const filteredItems = searchable
    ? items.filter((item) =>
        item.label.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : items;

  const dropdownButtonStyle: ViewStyle[] = [
    styles.dropdownButton,
    styles[variant],
    styles[`${size}Size`] as ViewStyle,
    ...(disabled ? [styles.disabled] : []),
    ...(style ? [style] : []),
  ];

  const dropdownTextStyle: TextStyle[] = [
    styles.dropdownText,
    styles[`${size}Text`] as TextStyle,
    ...(selectedItem && textStyle ? [textStyle] : []),
    ...(!selectedItem && placeholderStyle ? [placeholderStyle] : []),
    ...(!selectedItem && !placeholderStyle ? [styles.placeholderText] : []),
  ];

  const toggleDropdown = useCallback(() => {
    if (!disabled) {
      setIsOpen(!isOpen);
      setSearchQuery("");
    }
  }, [disabled, isOpen]);

  const handleSelect = useCallback(
    (item: DropdownItem) => {
      onSelect(item);
      setIsOpen(false);
      setSearchQuery("");
    },
    [onSelect],
  );

  const handleClose = useCallback(() => {
    setIsOpen(false);
    setSearchQuery("");
  }, []);

  const handleSearch = useCallback((text: string) => {
    setSearchQuery(text);
  }, []);

  const handleSelectItem = useCallback(
    (item: DropdownItem) => () => {
      handleSelect(item);
    },
    [handleSelect],
  );

  const renderDropdownItem = useCallback(
    ({ item }: { item: DropdownItem }) => {
      const isSelected = item.value === selectedValue;

      if (renderItem) {
        return (
          <TouchableOpacity
            style={[styles.dropdownItem, itemStyle ?? {}]}
            onPress={handleSelectItem(item)}
          >
            {renderItem(item, isSelected)}
          </TouchableOpacity>
        );
      }

      return (
        <TouchableOpacity
          style={[
            styles.dropdownItem,
            isSelected && styles.selectedItem,
            itemStyle ?? {},
          ]}
          onPress={handleSelectItem(item)}
        >
          <Text
            style={[styles.itemText, isSelected && styles.selectedItemText]}
          >
            {item.label}
          </Text>
          {isSelected && (
            <IconSymbol name="checkmark" size={16} color="#007AFF" />
          )}
        </TouchableOpacity>
      );
    },
    [handleSelectItem, itemStyle, renderItem, selectedValue],
  );

  return (
    <View>
      <TouchableOpacity
        style={dropdownButtonStyle}
        onPress={toggleDropdown}
        disabled={disabled}
        activeOpacity={disabled ? 1 : 0.7}
      >
        <Text style={dropdownTextStyle}>
          {selectedItem ? selectedItem.label : placeholder}
        </Text>
        <IconSymbol
          name={isOpen ? "chevron.up" : "chevron.down"}
          size={size === "small" ? 14 : 16}
          color={disabled ? "#999" : "#666"}
        />
      </TouchableOpacity>

      <Modal
        visible={isOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={handleClose}
      >
        <Pressable style={styles.modalOverlay} onPress={handleClose}>
          <View style={[styles.dropdownContainer, dropdownStyle]}>
            {searchable && (
              <View style={styles.searchContainer}>
                <IconSymbol name="magnifyingglass" size={16} color="#666" />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search..."
                  value={searchQuery}
                  onChangeText={handleSearch}
                  autoFocus={true}
                />
              </View>
            )}
            <FlatList
              data={filteredItems}
              keyExtractor={(item) => item.id}
              renderItem={renderDropdownItem}
              style={[styles.dropdownList, { maxHeight }]}
              showsVerticalScrollIndicator={true}
              keyboardShouldPersistTaps="handled"
            />
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  dropdownButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 8,
    backgroundColor: "#fff",
  },

  // Variants
  default: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  outlined: {
    borderWidth: 1,
    borderColor: "#007AFF",
    backgroundColor: "transparent",
  },
  filled: {
    backgroundColor: "#f5f5f5",
    borderWidth: 0,
  },

  // Sizes
  smallSize: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  mediumSize: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  largeSize: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 10,
  },

  // States
  disabled: {
    opacity: 0.5,
    backgroundColor: "#f8f8f8",
  },

  // Text styles
  dropdownText: {
    flex: 1,
    color: "#333",
  },
  placeholderText: {
    color: "#999",
  },

  // Text sizes
  smallText: {
    fontSize: 14,
  },
  mediumText: {
    fontSize: 16,
  },
  largeText: {
    fontSize: 18,
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  dropdownContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    maxWidth: "100%",
    minWidth: 250,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  dropdownList: {
    paddingVertical: 8,
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 44,
  },
  selectedItem: {
    backgroundColor: "#f0f8ff",
  },
  itemText: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  selectedItemText: {
    color: "#007AFF",
    fontWeight: "500",
  },
});
