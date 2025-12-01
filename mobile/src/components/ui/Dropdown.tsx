import React, { useCallback, useState, useRef } from "react";
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
  Animated,
  Dimensions,
  PanResponder,
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
  value: string | number;
}

export interface DropdownProps {
  items: DropdownItem[];
  selectedValue?: string | number;
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

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const TRAY_MAX_HEIGHT = SCREEN_HEIGHT * 0.7;

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
  maxHeight: _maxHeight = 300,
  searchable = false,
  renderItem,
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const slideAnim = useRef(new Animated.Value(0)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;

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

  const openTray = useCallback(() => {
    if (disabled) return;

    setIsOpen(true);
    setSearchQuery("");

    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(backdropAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [disabled, slideAnim, backdropAnim]);

  const closeTray = useCallback(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(backdropAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsOpen(false);
      setSearchQuery("");
    });
  }, [slideAnim, backdropAnim]);

  const handleSelect = useCallback(
    (item: DropdownItem) => {
      onSelect(item);
      closeTray();
    },
    [onSelect, closeTray],
  );

  const handleClose = useCallback(() => {
    closeTray();
  }, [closeTray]);

  const handleSearch = useCallback((text: string) => {
    setSearchQuery(text);
  }, []);

  const handleSelectItem = useCallback(
    (item: DropdownItem) => () => {
      handleSelect(item);
    },
    [handleSelect],
  );

  // Pan responder for swipe-to-close gesture
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return (
          gestureState.dy > 20 &&
          Math.abs(gestureState.dx) < Math.abs(gestureState.dy)
        );
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          const progress = Math.min(gestureState.dy / 200, 1);
          slideAnim.setValue(1 - progress);
          backdropAnim.setValue(1 - progress * 0.5);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 100) {
          closeTray();
        } else {
          // Snap back to open position
          Animated.parallel([
            Animated.timing(slideAnim, {
              toValue: 1,
              duration: 200,
              useNativeDriver: true,
            }),
            Animated.timing(backdropAnim, {
              toValue: 1,
              duration: 200,
              useNativeDriver: true,
            }),
          ]).start();
        }
      },
    }),
  ).current;

  const keyExtractor = useCallback((item: DropdownItem) => item.id, []);

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

  const trayHeight = Math.min(
    filteredItems.length * 56 + (searchable ? 60 : 0) + 40,
    TRAY_MAX_HEIGHT,
  );

  const slideTranslateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [trayHeight, 0],
  });

  const backdropOpacity = backdropAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.5],
  });

  return (
    <View>
      <TouchableOpacity
        style={dropdownButtonStyle}
        onPress={openTray}
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
        animationType="none"
        onRequestClose={handleClose}
      >
        <View style={styles.trayContainer}>
          <Animated.View
            style={[styles.trayBackdrop, { opacity: backdropOpacity }]}
          >
            <Pressable style={StyleSheet.absoluteFill} onPress={handleClose} />
          </Animated.View>

          <Animated.View
            style={[
              styles.tray,
              dropdownStyle,
              {
                height: trayHeight,
                transform: [{ translateY: slideTranslateY }],
              },
            ]}
            {...panResponder.panHandlers}
          >
            <View style={styles.trayHandle} />

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
              keyExtractor={keyExtractor}
              renderItem={renderDropdownItem}
              style={[
                styles.dropdownList,
                { maxHeight: trayHeight - (searchable ? 60 : 0) - 40 },
              ]}
              showsVerticalScrollIndicator={true}
              keyboardShouldPersistTaps="handled"
            />
          </Animated.View>
        </View>
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

  // Tray styles
  trayContainer: {
    flex: 1,
    justifyContent: "flex-end",
  },
  trayBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#000",
  },
  tray: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  trayHandle: {
    width: 40,
    height: 4,
    backgroundColor: "#d0d0d0",
    borderRadius: 2,
    alignSelf: "center",
    marginTop: 8,
    marginBottom: 8,
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
