import { useRouter } from "expo-router";
import { useCallback } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

import { AccountData } from "@/types/account";

import { Card, IconSymbol } from "./ui";

export type AccountProps = {
  account: AccountData;
};

export default function Account({ account }: AccountProps) {
  const router = useRouter();

  const handlePress = useCallback(() => {
    router.push({
      pathname: "/account-details",
      params: { account: JSON.stringify(account) },
    });
  }, [account, router]);

  return (
    <TouchableOpacity onPress={handlePress}>
      <Card margin="small">
        <View style={styles.accountContent}>
          <View style={styles.accountIcon}>
            <IconSymbol name={account.icon} size={24} color="#666" />
          </View>
          <View>
            <Text style={styles.accountName}>{account.name}</Text>
            <Text style={styles.accountAmount}>
              {account.amount.toLocaleString("en-US", {
                style: "currency",
                currency: "USD",
              })}
            </Text>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  accountContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  accountIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  accountName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },
  accountAmount: {
    fontSize: 14,
    color: "#007AFF",
    marginTop: 2,
  },
});
