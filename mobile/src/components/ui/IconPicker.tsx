import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ViewStyle,
} from "react-native";
import { IconSymbol } from "./IconSymbol";

export interface IconPickerProps {
  selectedIcon?: string;
  onIconSelect: (icon: string) => void;
  title?: string;
  containerStyle?: ViewStyle;
}

const AVAILABLE_ICONS = [
  "house.fill",
  "car.fill",
  "cart.fill",
  "creditcard.fill",
  "dollarsign.circle.fill",
  "gift.fill",
  "heart.fill",
  "star.fill",
  "book.fill",
  "gamecontroller.fill",
  "music.note",
  "camera.fill",
  "phone.fill",
  "envelope.fill",
  "calendar",
  "clock.fill",
  "location.fill",
  "airplane",
  "bicycle",
  "bus.fill",
  "train.side.front.car",
  "taxi.fill",
  "fuelpump.fill",
  "wrench.and.screwdriver.fill",
  "hammer.fill",
  "paintbrush.pointed.fill",
  "fork.knife",
  "cup.and.saucer.fill",
  "wineglass.fill",
  "birthday.cake.fill",
  "leaf.fill",
  "flame.fill",
  "snowflake",
  "sun.max.fill",
  "moon.fill",
  "cloud.fill",
  "bolt.fill",
  "drop.fill",
  "mountain.2.fill",
  "tree.fill",
  "figure.walk",
  "figure.run",
  "dumbbell.fill",
  "tennis.racket",
  "football.fill",
  "basketball.fill",
  "baseball.fill",
  "soccerball",
];

export default function IconPicker({
  selectedIcon,
  onIconSelect,
  title = "Select Icon",
  containerStyle,
}: IconPickerProps) {
  return (
    <View style={[styles.container, containerStyle]}>
      <Text style={styles.title}>{title}</Text>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.iconsContainer}
      >
        {AVAILABLE_ICONS.map((icon) => (
          <TouchableOpacity
            key={icon}
            style={[
              styles.iconButton,
              selectedIcon === icon && styles.selectedIconButton,
            ]}
            onPress={() => onIconSelect(icon)}
            activeOpacity={0.7}
          >
            <IconSymbol
              name={icon as any}
              size={24}
              color={selectedIcon === icon ? "#007AFF" : "#666"}
            />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  scrollView: {
    maxHeight: 200,
  },
  iconsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    paddingBottom: 12,
  },
  iconButton: {
    width: 44,
    height: 44,
    backgroundColor: "#f8f8f8",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  selectedIconButton: {
    backgroundColor: "#e8f4fd",
    borderColor: "#007AFF",
    borderWidth: 2,
  },
});