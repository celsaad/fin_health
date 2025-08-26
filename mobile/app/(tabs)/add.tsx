import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { View, StyleSheet, ScrollView, Alert } from "react-native";

import {
  Header,
  Input,
  Button,
  QuickAmountPicker,
  Section,
  ScreenContainer,
  DatePicker,
} from "@/components/ui";
import { useNavigationUtils } from "@/hooks/useNavigationUtils";
import { Category } from "@/types/category";

const quickAmounts = [10, 20, 50, 100];

const categories: Category[] = [
  { id: "groceries", name: "Groceries" },
  { id: "dining-out", name: "Dining Out" },
  { id: "transportation", name: "Transportation" },
  { id: "entertainment", name: "Entertainment" },
  { id: "utilities", name: "Utilities" },
  { id: "rent", name: "Rent" },
  { id: "salary", name: "Salary" },
  { id: "shopping", name: "Shopping" },
  { id: "healthcare", name: "Healthcare" },
];

export default function AddTransactionScreen() {
  const router = useRouter();
  const [amount, setAmount] = useState("");
  const [selectedQuickAmount, setSelectedQuickAmount] = useState<
    number | undefined
  >(undefined);
  const [date, setDate] = useState(new Date());
  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [notes, setNotes] = useState("");

  const { back } = useNavigationUtils();

  const handleAddTransaction = useCallback(() => {
    if (!amount || !category) {
      Alert.alert(
        "Error",
        "Please fill in required fields (amount and category)"
      );
      return;
    }

    // Here you would typically save the transaction to your data store
    Alert.alert("Success", "Transaction added successfully!", [
      {
        text: "OK",
        onPress: () => {
          // Reset form
          setAmount("");
          setSelectedQuickAmount("");
          setCategory("");
          setSubcategory("");
          setNotes("");
          // Navigate back to dashboard or transactions
          router.push("/(tabs)");
        },
      },
    ]);
  }, [amount, category, router]);

  const handleAmountChange = useCallback((text: string) => {
    setAmount(text);
    setSelectedQuickAmount("");
  }, []);

  const handleQuickAmountSelect = useCallback(
    (quickAmount: number) => {
      setSelectedQuickAmount(quickAmount);
      setAmount(quickAmount.toString());
    },
    [setSelectedQuickAmount, setAmount]
  );

  const handleCategoryPress = useCallback(
    (categoryId: string) => () => {
      setCategory(categoryId);
    },
    [setCategory]
  );

  return (
    <ScreenContainer bottomPadding={50}>
      {/* Header */}
      <Header title="Add Transaction" leftIcon="xmark" onLeftPress={back} />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Amount Section */}
        <Section title="Amount">
          <Input
            placeholder="0.00"
            value={amount}
            onChangeText={handleAmountChange}
            keyboardType="numeric"
            leftIcon="dollarsign"
            containerStyle={styles.amountInput}
          />

          <QuickAmountPicker
            amounts={quickAmounts}
            selectedAmount={selectedQuickAmount}
            onAmountSelect={handleQuickAmountSelect}
          />
        </Section>

        {/* Date Section */}
        <Section title="Date">
          <DatePicker date={date} setDate={setDate} />
        </Section>

        {/* Category Section */}
        <Section title="Category">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoriesContainer}
          >
            {categories.map((cat, index) => (
              <Button
                key={index}
                title={cat.name}
                variant={category === cat.id ? "primary" : "secondary"}
                size="small"
                onPress={handleCategoryPress(cat.id)}
                style={styles.categoryButton}
              />
            ))}
          </ScrollView>
        </Section>

        {/* Subcategory Section */}
        <Section title="Subcategory (Optional)">
          <Input
            placeholder="Enter subcategory"
            value={subcategory}
            onChangeText={setSubcategory}
          />
        </Section>

        {/* Notes Section */}
        <Section title="Notes">
          <Input
            placeholder="Add any notes about this transaction..."
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={4}
            style={styles.notesInputStyle}
          />
        </Section>
      </ScrollView>

      {/* Add Button */}
      <View style={styles.buttonContainer}>
        <Button
          title="Add Transaction"
          variant="primary"
          size="large"
          fullWidth
          onPress={handleAddTransaction}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  amountInput: {
    marginBottom: 16,
  },
  categoriesContainer: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  categoryButton: {
    marginRight: 12,
  },
  notesInputStyle: {
    height: 100,
    textAlignVertical: "top",
  },
  buttonContainer: {
    padding: 20,
    paddingBottom: 40,
  },
});
