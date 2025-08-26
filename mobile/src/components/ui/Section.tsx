import { SFSymbol } from "expo-symbols";
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TouchableOpacity,
} from "react-native";

import { IconSymbol } from "./IconSymbol";

export interface SectionProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  spacing?: "none" | "small" | "medium" | "large";
  style?: ViewStyle;
  icon?: SFSymbol;
  onPress?: () => void;
}

export default function Section({
  title,
  subtitle,
  children,
  spacing = "medium",
  style,
  icon,
  onPress,
}: SectionProps) {
  return (
    <View style={[styles.section, styles[`${spacing}Spacing`], style]}>
      {(title || subtitle) && (
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            {title && <Text style={styles.title}>{title}</Text>}
            {icon && (
              <TouchableOpacity onPress={onPress}>
                <IconSymbol name={icon} size={20} color="#000" />
              </TouchableOpacity>
            )}
          </View>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
      )}
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: 20,
  },

  // Spacing variants
  noneSpacing: {
    marginBottom: 0,
  },
  smallSpacing: {
    marginBottom: 16,
  },
  mediumSpacing: {
    marginBottom: 24,
  },
  largeSpacing: {
    marginBottom: 32,
  },

  header: {
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  content: {
    // Content styling can be added here if needed
  },
});
