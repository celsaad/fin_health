import React from "react";
import { TouchableOpacity, View, StyleSheet, ViewStyle } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolateColor,
} from "react-native-reanimated";

export interface ToggleSwitchProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  size?: "small" | "medium" | "large";
  disabled?: boolean;
  style?: ViewStyle;
}

export default function ToggleSwitch({
  value,
  onValueChange,
  size = "medium",
  disabled = false,
  style,
}: ToggleSwitchProps) {
  const animatedValue = useSharedValue(value ? 1 : 0);

  React.useEffect(() => {
    animatedValue.value = withTiming(value ? 1 : 0, { duration: 200 });
  }, [value, animatedValue]);

  const sizes = {
    small: { width: 40, height: 24, thumbSize: 20, padding: 2 },
    medium: { width: 48, height: 28, thumbSize: 24, padding: 2 },
    large: { width: 56, height: 32, thumbSize: 28, padding: 2 },
  };

  const currentSize = sizes[size];

  const trackStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      animatedValue.value,
      [0, 1],
      ["#e0e0e0", "#007AFF"]
    );

    return {
      backgroundColor,
      opacity: disabled ? 0.5 : 1,
    };
  });

  const thumbStyle = useAnimatedStyle(() => {
    const translateX =
      animatedValue.value *
      (currentSize.width - currentSize.thumbSize - currentSize.padding * 2);

    return {
      transform: [{ translateX }],
    };
  });

  const handlePress = () => {
    if (!disabled) {
      onValueChange(!value);
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          width: currentSize.width,
          height: currentSize.height,
        },
        style,
      ]}
      onPress={handlePress}
      disabled={disabled}
      activeOpacity={disabled ? 1 : 0.7}
    >
      <Animated.View
        style={[
          styles.track,
          {
            width: currentSize.width,
            height: currentSize.height,
            borderRadius: currentSize.height / 2,
          },
          trackStyle,
        ]}
      >
        <Animated.View
          style={[
            styles.thumb,
            {
              width: currentSize.thumbSize,
              height: currentSize.thumbSize,
              borderRadius: currentSize.thumbSize / 2,
              margin: currentSize.padding,
            },
            thumbStyle,
          ]}
        />
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
  },
  track: {
    justifyContent: "center",
  },
  thumb: {
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
});
