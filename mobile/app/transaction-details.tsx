import { useLocalSearchParams } from "expo-router";
import { noop } from "lodash";
import { useCallback } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";

import { Header, Card, Button, ScreenContainer } from "@/components/ui";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { useNavigationUtils } from "@/hooks/useNavigationUtils";
import { TransactionData } from "@/types/transaction";

export default function TransactionDetailsScreen() {
  const { transaction: transactionParam } = useLocalSearchParams<{
    transaction: string;
  }>();

  // Parse the transaction object from navigation params, fallback to mock data
  const transaction: TransactionData = transactionParam
    ? JSON.parse(transactionParam)
    : {
        id: "1",
        name: "Whole Foods",
        amount: "-$50.00",
        date: "July 14, 2024",
        category: {
          id: "groceries",
          name: "Groceries",
        },
        subcategory: {
          id: "groceries",
          name: "Food",
        },
        notes:
          "Purchased groceries for the week at Whole Foods. Included fresh produce, dairy, and pantry staples.",
        color: "#ff3b30",
        icon: "cart.fill",
        account: {
          id: "checking",
          name: "Checking",
          amount: "$1,234.56",
          icon: "building.columns.fill",
        },
      };

  const transactionDetails = [
    {
      icon: "calendar",
      label: "Date",
      value: transaction.date,
    },
    {
      icon: "dollarsign.circle.fill",
      label: "Amount",
      value: transaction.amount,
      valueColor: transaction.color,
    },
    {
      icon: "tag.fill",
      label: "Category",
      value: transaction.category.name,
    },
    {
      icon: "tag",
      label: "Subcategory",
      value: transaction.subcategory?.name,
    },
    {
      icon: transaction.account.icon,
      label: "Account",
      value: transaction.account.name,
    },
  ];

  const { back } = useNavigationUtils();

  const handleShare = useCallback(() => {
    console.log("Share");
  }, []);

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
            .filter(detail => detail.value !== undefined)
            .map((detail, index) => (
              <Card key={index} margin="small">
                <View style={styles.detailContent}>
                  <View style={styles.detailIcon}>
                    <IconSymbol name={detail.icon} size={20} color="#666" />
                  </View>
                  <View>
                    <Text style={styles.detailValue} numberOfLines={1}>
                      {detail.value}
                    </Text>
                    <Text style={styles.detailLabel}>{detail.label}</Text>
                  </View>
                </View>
              </Card>
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
