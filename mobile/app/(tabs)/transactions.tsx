import React, { useCallback, useMemo, useState } from "react";
import { View, StyleSheet, ScrollView } from "react-native";

import Transaction from "@/components/Transaction";
import { Header, Input, Button, ScreenContainer } from "@/components/ui";
import { TransactionData } from "@/types/transaction";

const transactions: TransactionData[] = [
  {
    name: "Whole Foods",
    category: {
      id: "groceries",
      name: "Groceries",
    },
    subcategory: {
      id: "groceries",
      name: "Groceries",
    },
    account: {
      id: "checking",
      name: "Checking",
      amount: "$1,234.56",
      icon: "building.columns.fill",
    },
    amount: "-$50.00",
    icon: "cart.fill",
    color: "#ff3b30",
    date: "Today",
    hasNote: true,
  },
  {
    name: "Tech Solutions Inc.",
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
      amount: "$1,234.56",
      icon: "building.columns.fill",
    },
    amount: "+$2,500.00",
    icon: "briefcase.fill",
    color: "#34c759",
    date: "Yesterday",
    hasNote: false,
  },
  {
    name: "Apartment Complex",
    category: {
      id: "rent",
      name: "Rent",
    },
    subcategory: {
      id: "rent",
      name: "Rent",
    },
    account: {
      id: "checking",
      name: "Checking",
      amount: "$1,234.56",
      icon: "building.columns.fill",
    },
    amount: "-$1,200.00",
    icon: "house.fill",
    color: "#ff3b30",
    date: "2 days ago",
    hasNote: false,
  },
  {
    name: "Sushi Bar",
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
      amount: "$1,234.56",
      icon: "building.columns.fill",
    },
    amount: "-$30.00",
    icon: "fork.knife",
    color: "#ff3b30",
    date: "3 days ago",
    hasNote: true,
  },
  {
    name: "Energy Co.",
    category: {
      id: "utilities",
      name: "Utilities",
    },
    subcategory: {
      id: "utilities",
      name: "Utilities",
    },
    account: {
      id: "checking",
      name: "Checking",
      amount: "$1,234.56",
      icon: "building.columns.fill",
    },
    amount: "-$150.00",
    icon: "lightbulb.fill",
    color: "#ff3b30",
    date: "1 week ago",
    hasNote: false,
  },
  {
    name: "Movie Theater",
    category: {
      id: "entertainment",
      name: "Entertainment",
    },
    subcategory: {
      id: "entertainment",
      name: "Entertainment",
    },
    account: {
      id: "checking",
      name: "Checking",
      amount: "$1,234.56",
      icon: "building.columns.fill",
    },
    amount: "-$25.00",
    icon: "tv.fill",
    color: "#ff3b30",
    date: "1 week ago",
    hasNote: false,
  },
  {
    name: "Gas Station",
    category: {
      id: "transportation",
      name: "Transportation",
    },
    subcategory: {
      id: "transportation",
      name: "Transportation",
    },
    account: {
      id: "checking",
      name: "Checking",
      amount: "$1,234.56",
      icon: "building.columns.fill",
    },
    amount: "-$40.00",
    icon: "car.fill",
    color: "#ff3b30",
    date: "1 week ago",
    hasNote: false,
  },
];

export default function TransactionsScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("date");

  const filteredTransactions = useMemo(
    () =>
      transactions.filter(
        transaction =>
          transaction.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          transaction.category.name
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          transaction.subcategory.name
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          transaction.account.name
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
      ),
    [searchQuery]
  );

  const handleSortByDate = useCallback(() => {
    setSortBy("date");
  }, []);

  const handleSortByAmount = useCallback(() => {
    setSortBy("amount");
  }, []);

  return (
    <ScreenContainer hasTabBar>
      {/* Header */}
      <Header title="Transactions" rightIcon="slider.horizontal.3" />

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Input
          variant="search"
          placeholder="Search transactions"
          value={searchQuery}
          onChangeText={setSearchQuery}
          leftIcon="magnifyingglass"
          containerStyle={styles.searchInput}
        />
      </View>

      {/* Sort Buttons */}
      <View style={styles.sortContainer}>
        <Button
          title="Date"
          variant={sortBy === "date" ? "primary" : "ghost"}
          size="small"
          icon="arrow.up.arrow.down"
          onPress={handleSortByDate}
        />

        <Button
          title="Amount"
          variant={sortBy === "amount" ? "primary" : "ghost"}
          size="small"
          icon="arrow.up.arrow.down"
          onPress={handleSortByAmount}
        />
      </View>

      {/* Transactions List */}
      <ScrollView
        style={styles.transactionsList}
        showsVerticalScrollIndicator={false}
      >
        {filteredTransactions.map((transaction, index) => (
          <Transaction key={index} transaction={transaction} index={index} />
        ))}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  searchInput: {
    marginBottom: 0,
  },
  sortContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 12,
  },
  transactionsList: {
    flex: 1,
    paddingHorizontal: 20,
  },
});
