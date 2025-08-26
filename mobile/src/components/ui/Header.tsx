import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from "react-native";

import { IconSymbol } from "./IconSymbol";

export interface HeaderProps {
  title: string;
  leftIcon?: string;
  rightIcon?: string;
  onLeftPress?: () => void;
  onRightPress?: () => void;
  variant?: "default" | "large" | "minimal";
  style?: ViewStyle;
}

export default function Header({
  title,
  leftIcon,
  rightIcon,
  onLeftPress,
  onRightPress,
  variant = "default",
  style,
}: HeaderProps) {
  return (
    <View style={[styles.header, styles[variant], style]}>
      <View style={styles.leftSection}>
        {leftIcon && onLeftPress ? (
          <TouchableOpacity style={styles.iconButton} onPress={onLeftPress}>
            <IconSymbol name={leftIcon} size={24} color="#000" />
          </TouchableOpacity>
        ) : (
          <View style={styles.placeholder} />
        )}
      </View>

      <Text style={[styles.title, styles[`${variant}Title`]]} numberOfLines={1}>
        {title}
      </Text>

      <View style={styles.rightSection}>
        {rightIcon && onRightPress ? (
          <TouchableOpacity style={styles.iconButton} onPress={onRightPress}>
            <IconSymbol name={rightIcon} size={24} color="#000" />
          </TouchableOpacity>
        ) : (
          <View style={styles.placeholder} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },

  // Variants
  default: {
    paddingTop: 60,
    paddingBottom: 20,
  },
  large: {
    paddingTop: 60,
    paddingBottom: 30,
  },
  minimal: {
    paddingTop: 50,
    paddingBottom: 15,
  },

  leftSection: {
    width: 40,
    alignItems: "flex-start",
  },
  rightSection: {
    width: 40,
    alignItems: "flex-end",
  },

  iconButton: {
    padding: 8,
    margin: -8, // Negative margin to maintain spacing while increasing touch area
  },

  placeholder: {
    width: 40,
    height: 40,
  },

  title: {
    flex: 1,
    textAlign: "center",
    fontWeight: "bold",
    color: "#000",
  },

  // Title variants
  defaultTitle: {
    fontSize: 20,
  },
  largeTitle: {
    fontSize: 24,
  },
  minimalTitle: {
    fontSize: 18,
  },
});
