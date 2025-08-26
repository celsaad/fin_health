import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from "react-native";

import { IconSymbol } from "./IconSymbol";

export interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "small" | "medium" | "large";
  icon?: string;
  iconPosition?: "left" | "right";
  disabled?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
}

export default function Button({
  title,
  onPress,
  variant = "primary",
  size = "medium",
  icon,
  iconPosition = "left",
  disabled = false,
  fullWidth = false,
  style,
}: ButtonProps) {
  const buttonStyle: ViewStyle[] = [
    styles.button,
    styles[variant],
    styles[`${size}Size`],
    fullWidth && styles.fullWidth,
    disabled && styles.disabled,
    style,
  ];

  const textStyle: TextStyle[] = [
    styles.text,
    styles[`${variant}Text`],
    styles[`${size}Text`],
    disabled && styles.disabledText,
  ];

  const iconColor =
    variant === "primary"
      ? "#fff"
      : variant === "secondary"
        ? "#333"
        : variant === "outline"
          ? "#007AFF"
          : "#007AFF";

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={disabled ? 1 : 0.7}
    >
      {icon && iconPosition === "left" && (
        <IconSymbol
          name={icon}
          size={size === "small" ? 16 : 20}
          color={iconColor}
        />
      )}
      <Text style={textStyle}>{title}</Text>
      {icon && iconPosition === "right" && (
        <IconSymbol
          name={icon}
          size={size === "small" ? 16 : 20}
          color={iconColor}
        />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 25,
    gap: 8,
  },

  // Variants
  primary: {
    backgroundColor: "#007AFF",
    shadowColor: "#007AFF",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  secondary: {
    backgroundColor: "#f0f0f0",
  },
  outline: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#007AFF",
  },
  ghost: {
    backgroundColor: "transparent",
  },

  // Sizes
  smallSize: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
  },
  mediumSize: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  largeSize: {
    paddingHorizontal: 32,
    paddingVertical: 16,
  },

  // States
  disabled: {
    opacity: 0.5,
  },
  fullWidth: {
    width: "100%",
  },

  // Text styles
  text: {
    fontWeight: "600",
    textAlign: "center",
  },
  primaryText: {
    color: "#fff",
  },
  secondaryText: {
    color: "#333",
  },
  outlineText: {
    color: "#007AFF",
  },
  ghostText: {
    color: "#007AFF",
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

  disabledText: {
    opacity: 0.7,
  },
});
