import React from "react";
import { View, StyleSheet, ViewStyle, TouchableOpacity } from "react-native";

export interface CardProps {
  children: React.ReactNode;
  variant?: "default" | "elevated" | "outlined" | "flat";
  padding?: "none" | "small" | "medium" | "large";
  margin?: "none" | "small" | "medium" | "large";
  onPress?: () => void;
  style?: ViewStyle;
}

export default function Card({
  children,
  variant = "default",
  padding = "medium",
  margin = "none",
  onPress,
  style,
}: CardProps) {
  const cardStyle: ViewStyle[] = [
    styles.card,
    styles[variant],
    styles[`${padding}Padding`],
    styles[`${margin}Margin`],
    style ?? {},
  ];

  if (onPress) {
    return (
      <TouchableOpacity style={cardStyle} onPress={onPress} activeOpacity={0.7}>
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={cardStyle}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
  },

  // Variants
  default: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  elevated: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  outlined: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    shadowOpacity: 0,
    elevation: 0,
  },
  flat: {
    shadowOpacity: 0,
    elevation: 0,
  },

  // Padding variants
  nonePadding: {
    padding: 0,
  },
  smallPadding: {
    padding: 12,
  },
  mediumPadding: {
    padding: 16,
  },
  largePadding: {
    padding: 20,
  },

  // Margin variants
  noneMargin: {
    margin: 0,
  },
  smallMargin: {
    marginBottom: 8,
  },
  mediumMargin: {
    marginBottom: 12,
  },
  largeMargin: {
    marginBottom: 16,
  },
});
