import { useRouter } from "expo-router";
import { useCallback } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useLazyLoadQuery, graphql } from "react-relay";

import Account from "@/src/components/Account";
import Transaction from "@/src/components/Transaction";
import { Header, Section, Card, ScreenContainer } from "@/src/components/ui";
import { TransactionData } from "@/src/types/transaction";

import type { tabs_indexQuery } from "./__generated__/tabs_indexQuery.graphql";

// const accounts: AccountData[] = [
//   {
//     id: "checking",
//     name: "Checking",
//     amount: 1234.56,
//     icon: "building.columns.fill",
//   },
//   { id: "savings", name: "Savings", amount: 5678.9, icon: "banknote" },
// ];

const recentTransactions: TransactionData[] = [
  {
    name: "Supermarket",
    category: {
      id: "groceries",
      name: "Groceries",
    },
    subcategory: {
      id: "groceries",
      name: "Food",
    },
    account: {
      id: "checking",
      name: "Checking",
      balance: 1234.56,
      icon: "building.columns.fill",
    },
    date: "Today",
    hasNote: true,
    amount: -50,
    icon: "cart.fill",
    color: "#ff3b30",
  },
  {
    name: "Tech Corp",
    category: {
      id: "salary",
      name: "Salary",
    },
    subcategory: {
      id: "salary",
      name: "Salary",
    },
    account: {
      id: "checking",
      name: "Checking",
      balance: 1234.56,
      icon: "building.columns.fill",
    },
    date: "Yesterday",
    hasNote: false,
    amount: 2000,
    icon: "briefcase.fill",
    color: "#34c759",
  },
  {
    name: "Restaurant",
    category: {
      id: "dining-out",
      name: "Dining Out",
    },
    subcategory: {
      id: "dining-out",
      name: "Dining Out",
    },
    account: {
      id: "checking",
      name: "Checking",
      balance: 1234.56,
      icon: "building.columns.fill",
    },
    amount: -30,
    icon: "fork.knife",
    color: "#ff3b30",
  },
];

const monthlyData = ["Jan", "Feb", "Mar", "Apr", "May"];

export default function DashboardScreen() {
  const { accounts } = useLazyLoadQuery<tabs_indexQuery>(
    graphql`
      query tabs_indexQuery {
        accounts {
          id
          name
          type
          balance
          icon
        }
      }
    `,
    {},
  );

  const router = useRouter();

  const handleAddAccount = useCallback(() => {
    router.push({
      pathname: "/add-account",
    });
  }, [router]);

  return (
    <ScreenContainer hasTabBar>
      {/* Header */}
      <Header title="Dashboard" leftIcon="line.horizontal.3" />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Accounts Section */}
        <Section
          title="Accounts"
          icon="plus.app.fill"
          onPress={handleAddAccount}
        >
          {accounts.map((account, index) => (
            <Account key={index} account={account} />
          ))}
        </Section>

        {/* Recent Transactions */}
        <Section title="Recent Transactions">
          {recentTransactions.map((transaction, index) => (
            <Transaction
              key={index}
              transaction={transaction}
              index={index}
              compact={true}
            />
          ))}
        </Section>

        {/* Income vs Expenses Chart */}
        <Section title="Income vs. Expenses">
          <Card padding="large">
            <Text style={styles.chartTitle}>Monthly Overview</Text>
            <Text style={styles.chartAmount}>$1,920</Text>
            <Text style={styles.chartSubtitle}>
              This Month <Text style={styles.positiveChange}>+12%</Text>
            </Text>

            {/* Simple Bar Chart */}
            <View style={styles.chartContainer}>
              {monthlyData.map((month, index) => (
                <View key={index} style={styles.barContainer}>
                  <View style={[styles.bar, { height: 40 + index * 10 }]} />
                  <Text style={styles.barLabel}>{month}</Text>
                </View>
              ))}
            </View>
          </Card>
        </Section>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  chartTitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 8,
  },
  chartAmount: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 4,
  },
  chartSubtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 20,
  },
  positiveChange: {
    color: "#34c759",
    fontWeight: "600",
  },
  chartContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    height: 80,
  },
  barContainer: {
    alignItems: "center",
    flex: 1,
  },
  bar: {
    width: 20,
    backgroundColor: "#007AFF",
    borderRadius: 4,
    marginBottom: 8,
  },
  barLabel: {
    fontSize: 12,
    color: "#666",
  },
});
