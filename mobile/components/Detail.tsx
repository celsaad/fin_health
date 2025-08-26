import { SFSymbol } from "expo-symbols";
import { View, Text, StyleSheet } from "react-native";

import { Card, IconSymbol } from "./ui";

export type DetailData = {
  icon: SFSymbol;
  value?: string;
  label?: string;
  valueColor?: string;
};

export default function Detail({ detail }: { detail: DetailData }) {
  return (
    <Card margin="small">
      <View style={styles.detailContent}>
        <View style={styles.detailIcon}>
          <IconSymbol name={detail.icon} size={20} color="#666" />
        </View>
        <View>
          <Text
            style={[styles.detailValue, { color: detail.valueColor }]}
            numberOfLines={1}
          >
            {detail.value}
          </Text>
          {detail.label && (
            <Text style={styles.detailLabel}>{detail.label}</Text>
          )}
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  detailContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  detailIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginBottom: 2,
  },
  detailLabel: {
    fontSize: 13,
    color: "#666",
  },
});
