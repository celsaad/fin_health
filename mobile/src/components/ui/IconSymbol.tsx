// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { SymbolWeight, SymbolViewProps } from "expo-symbols";
import { ComponentProps } from "react";
import { OpaqueColorValue, type StyleProp, type TextStyle } from "react-native";

type IconMapping = Record<
  SymbolViewProps["name"],
  ComponentProps<typeof MaterialIcons>["name"]
>;
type IconSymbolName = keyof typeof MAPPING;

/**
 * Add your SF Symbols to Material Icons mappings here.
 * - see Material Icons in the [Icons Directory](https://icons.expo.fyi).
 * - see SF Symbols in the [SF Symbols](https://developer.apple.com/sf-symbols/) app.
 */
const MAPPING = {
  "house.fill": "home",
  "paperplane.fill": "send",
  "chevron.left.forwardslash.chevron.right": "code",
  "chevron.right": "chevron-right",
  "car.fill": "directions-car",
  "cart.fill": "shopping-cart",
  "creditcard.fill": "credit-card",
  "dollarsign.circle.fill": "attach-money",
  "gift.fill": "card-giftcard",
  "heart.fill": "favorite",
  "star.fill": "star",
  "book.fill": "menu-book",
  "gamecontroller.fill": "sports-esports",
  "music.note": "music-note",
  "camera.fill": "camera-alt",
  "phone.fill": "phone",
  "envelope.fill": "email",
  "calendar": "event",
  "clock.fill": "access-time",
  "location.fill": "location-on",
  "airplane": "flight",
  "bicycle": "directions-bike",
  "bus.fill": "directions-bus",
  "train.side.front.car": "train",
  "taxi.fill": "local-taxi",
  "fuelpump.fill": "local-gas-station",
  "wrench.and.screwdriver.fill": "build",
  "hammer.fill": "construction",
  "paintbrush.pointed.fill": "brush",
  "fork.knife": "restaurant",
  "cup.and.saucer.fill": "local-cafe",
  "wineglass.fill": "wine-bar",
  "birthday.cake.fill": "cake",
  "leaf.fill": "eco",
  "flame.fill": "local-fire-department",
  "snowflake": "ac-unit",
  "sun.max.fill": "wb-sunny",
  "moon.fill": "brightness-3",
  "cloud.fill": "cloud",
  "bolt.fill": "flash-on",
  "drop.fill": "water-drop",
  "mountain.2.fill": "landscape",
  "tree.fill": "park",
  "figure.walk": "directions-walk",
  "figure.run": "directions-run",
  "dumbbell.fill": "fitness-center",
  "tennis.racket": "sports-tennis",
  "football.fill": "sports-football",
  "basketball.fill": "sports-basketball",
  "baseball.fill": "sports-baseball",
  "soccerball": "sports-soccer",
  "plus": "add",
  "arrow.left.arrow.right": "swap-horiz",
} as IconMapping;

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 * Icon `name`s are based on SF Symbols and require manual mapping to Material Icons.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  return (
    <MaterialIcons
      color={color}
      size={size}
      name={MAPPING[name]}
      style={style}
    />
  );
}
