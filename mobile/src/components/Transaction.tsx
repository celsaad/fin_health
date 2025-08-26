import { useRouter } from "expo-router";
import { useCallback, useMemo } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

import { IconSymbol } from "@/src/components/ui/IconSymbol";
import { TransactionData } from "@/src/types/transaction";

import useFormatCurrency from "../hooks/useFormatCurrency";

export type TransactionProps = {
  transaction: TransactionData;
  index?: number;
  onPress?: () => void;
  compact?: boolean; // For different layouts (dashboard vs transactions list)
};

export default function Transaction({
  transaction,
  onPress,
  compact = false,
}: TransactionProps) {
  const router = useRouter();

  const handlePress = useCallback(() => {
    if (onPress) {
      onPress();
    } else {
      // Pass the entire transaction object as navigation params
      router.push({
        pathname: "/transaction-details",
        params: {
          transaction: JSON.stringify(transaction),
        },
      });
    }
  }, [onPress, router, transaction]);

  const formatCurrency = useFormatCurrency();

  const amount = useMemo(
    () => formatCurrency(transaction.amount),
    [transaction.amount, formatCurrency],
  );

  return (
    <TouchableOpacity style={styles.transactionCard} onPress={handlePress}>
      <View style={styles.transactionLeft}>
        <View
          style={[
            styles.transactionIcon,
            compact && styles.transactionIconCompact,
          ]}
        >
          <IconSymbol
            name={transaction.icon}
            size={compact ? 20 : 20}
            color="#666"
          />
        </View>
        <View style={styles.transactionDetails}>
          <View style={styles.transactionHeader}>
            <Text style={styles.transactionName}>{transaction.name}</Text>
            {transaction.hasNote && (
              <IconSymbol name="note.text" size={14} color="#007AFF" />
            )}
          </View>
          <Text style={styles.transactionCategory}>
            {transaction.category.name}
          </Text>
        </View>
      </View>
      <View style={styles.transactionRight}>
        <Text style={[styles.transactionAmount, { color: transaction.color }]}>
          {amount}
        </Text>
        {transaction.date && (
          <Text style={styles.transactionDate}>{transaction.date}</Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  transactionCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  transactionLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  transactionIconCompact: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  transactionName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#000",
  },
  transactionCategory: {
    fontSize: 13,
    color: "#666",
    marginTop: 2,
  },
  transactionRight: {
    alignItems: "flex-end",
  },
  transactionAmount: {
    fontSize: 15,
    fontWeight: "600",
  },
  transactionDate: {
    fontSize: 12,
    color: "#999",
    marginTop: 2,
  },
});
