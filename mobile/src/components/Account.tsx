import { useRouter } from "expo-router";
import { SFSymbol } from "expo-symbols";
import { useCallback, useMemo } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

import { AccountData } from "@/src/types/account";

import { getNumericalValueTextColor } from "../utils/getNumericalValueTextColor";

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

  const amount = useMemo(() => {
    const amount = account.balance ?? 0;

    return amount.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
    });
  }, [account.balance]);

  const amountColor = useMemo(() => {
    return getNumericalValueTextColor(account.balance ?? 0);
  }, [account.balance]);

  return (
    <TouchableOpacity onPress={handlePress}>
      <Card margin="small">
        <View style={styles.accountContent}>
          <View style={styles.accountIcon}>
            <IconSymbol
              name={account.icon as SFSymbol}
              size={24}
              color="#666"
            />
          </View>
          <View>
            <Text style={styles.accountName}>{account.name}</Text>
            <Text style={[styles.accountAmount, { color: amountColor }]}>
              {amount}
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
    marginTop: 2,
  },
});
