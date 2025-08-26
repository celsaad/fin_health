import { StatusBar } from "expo-status-bar";
import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";

export interface ScreenContainerProps {
  children: React.ReactNode;
  statusBarStyle?: "auto" | "inverted" | "light" | "dark";
  backgroundColor?: string;
  hasTabBar?: boolean; // For screens with bottom tab navigation
  bottomPadding?: number; // Custom bottom padding
  style?: ViewStyle;
}

export default function ScreenContainer({
  children,
  statusBarStyle = "dark",
  backgroundColor = "#f8f9fa",
  hasTabBar = false,
  bottomPadding,
  style,
}: ScreenContainerProps) {
  // Calculate bottom padding
  const calculatedBottomPadding =
    bottomPadding !== undefined
      ? bottomPadding
      : hasTabBar
        ? 90 // Standard tab bar height + safe area
        : 0;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor,
          paddingBottom: calculatedBottomPadding,
        },
        style,
      ]}
    >
      <StatusBar style={statusBarStyle} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
