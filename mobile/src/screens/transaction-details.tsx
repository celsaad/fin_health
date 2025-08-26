import { useLocalSearchParams } from "expo-router";
import { noop } from "lodash";
import { useCallback } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";

import { Header, Card, Button, ScreenContainer } from "@/src/components/ui";
import { IconSymbol } from "@/src/components/ui/IconSymbol";
import { useNavigationUtils } from "@/src/hooks/useNavigationUtils";
import { TransactionData } from "@/src/types/transaction";

import Detail, { DetailData } from "@/src/components/Detail";
import useFormatCurrency from "@/src/hooks/useFormatCurrency";

export default function TransactionDetailsScreen() {
  const { transaction: transactionParam } = useLocalSearchParams<{
    transaction: string;
  }>();

  // Parse the transaction object from navigation params, fallback to mock data
  const transaction: TransactionData = transactionParam
    ? JSON.parse(transactionParam)
    : null;

  const formatCurrency = useFormatCurrency();

  const { back } = useNavigationUtils();

  const handleShare = useCallback(() => {
    console.log("Share");
  }, []);

  if (!transaction) {
    return null;
  }

  const transactionDetails: DetailData[] = [
    {
      icon: "calendar",
      value: transaction.date,
    },
    {
      icon: "dollarsign.circle.fill",
      value: formatCurrency(transaction.amount),
      valueColor: transaction.color,
    },
    {
      icon: "tag.fill",
      value: transaction.category.name,
      label: transaction.subcategory?.name,
    },
    {
      icon: transaction.account.icon,
      label: "Account",
      value: transaction.account.name,
    },
  ];

  return (
    <ScreenContainer>
      {/* Header */}
      <Header
        title="Transaction Details"
        leftIcon="chevron.left"
        rightIcon="square.and.arrow.up"
        onLeftPress={back}
        onRightPress={handleShare} // Share action
      />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Transaction Header */}
        <View style={styles.transactionHeader}>
          <View style={styles.transactionIcon}>
            <IconSymbol name={transaction.icon} size={32} color="#666" />
          </View>
          <Text style={styles.transactionName}>{transaction.name}</Text>
          <Text
            style={[styles.transactionAmount, { color: transaction.color }]}
          >
            {transaction.amount}
          </Text>
        </View>

        {/* Transaction Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Transaction Information</Text>

          {transactionDetails
            .filter((detail) => detail.value !== undefined)
            .map((detail, index) => (
              <Detail key={index} detail={detail} />
            ))}
        </View>

        {/* Notes Section */}
        {transaction.notes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <Card padding="large">
              <Text style={styles.notesText}>{transaction.notes}</Text>
            </Card>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionsSection}>
          <Button
            title="Edit Transaction"
            variant="outline"
            icon="pencil"
            fullWidth
            onPress={noop}
          />

          <Button
            title="Delete Transaction"
            variant="outline"
            icon="trash"
            fullWidth
            onPress={noop}
            style={styles.deleteButton}
          />
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  transactionHeader: {
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  transactionIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  transactionName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 8,
  },
  transactionAmount: {
    fontSize: 20,
    fontWeight: "600",
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 16,
  },

  notesText: {
    fontSize: 15,
    color: "#333",
    lineHeight: 22,
  },
  actionsSection: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 12,
  },
  deleteButton: {
    borderColor: "#ff3b30",
  },
});
