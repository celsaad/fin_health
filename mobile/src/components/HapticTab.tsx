import { BottomTabBarButtonProps } from "@react-navigation/bottom-tabs";
import { PlatformPressable } from "@react-navigation/elements";
import * as Haptics from "expo-haptics";
import { useCallback } from "react";
import { GestureResponderEvent } from "react-native";

export function HapticTab(props: BottomTabBarButtonProps) {
  const handlePressIn = useCallback(
    (ev: GestureResponderEvent) => {
      if (process.env.EXPO_OS === "ios") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      props.onPressIn?.(ev);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [props.onPressIn],
  );

  return <PlatformPressable {...props} onPressIn={handlePressIn} />;
}
