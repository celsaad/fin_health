import { SFSymbol } from "expo-symbols";
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  ViewStyle,
  TextInputProps,
} from "react-native";

import { IconSymbol } from "./IconSymbol";

export interface InputProps extends TextInputProps {
  label?: string;
  variant?: "default" | "search" | "outlined";
  error?: string;
  leftIcon?: SFSymbol;
  rightIcon?: SFSymbol;
  containerStyle?: ViewStyle;
}

export default function Input({
  label,
  variant = "default",
  error,
  leftIcon,
  rightIcon,
  containerStyle,
  style,
  ...props
}: InputProps) {
  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}

      <View
        style={[styles.inputContainer, styles[variant], error && styles.error]}
      >
        {leftIcon && (
          <IconSymbol
            name={leftIcon}
            size={20}
            color="#666"
            style={styles.leftIcon}
          />
        )}

        <TextInput
          style={[
            styles.input,
            leftIcon && styles.inputWithLeftIcon,
            rightIcon && styles.inputWithRightIcon,
            style,
          ]}
          placeholderTextColor="#999"
          {...props}
        />

        {rightIcon && (
          <IconSymbol
            name={rightIcon}
            size={20}
            color="#666"
            style={styles.rightIcon}
          />
        )}
      </View>

      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    backgroundColor: "#f0f0f0",
  },

  // Variants
  default: {
    backgroundColor: "#f0f0f0",
  },
  search: {
    backgroundColor: "#f0f0f0",
    borderRadius: 25,
  },
  outlined: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },

  input: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 16,
    fontSize: 16,
    color: "#000",
  },
  inputWithLeftIcon: {
    paddingLeft: 8,
  },
  inputWithRightIcon: {
    paddingRight: 8,
  },

  leftIcon: {
    marginLeft: 16,
  },
  rightIcon: {
    marginRight: 16,
  },

  error: {
    borderColor: "#ff3b30",
    borderWidth: 1,
  },
  errorText: {
    fontSize: 14,
    color: "#ff3b30",
    marginTop: 4,
  },
});
