import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { View, StyleSheet, ScrollView, Alert } from "react-native";
import { graphql, useLazyLoadQuery, useMutation } from "react-relay";

import {
  Header,
  Input,
  Button,
  QuickAmountPicker,
  Section,
  ScreenContainer,
  DatePicker,
} from "@/src/components/ui";
import { useNavigationUtils } from "@/src/hooks/useNavigationUtils";

import { AccountDropdown } from "../../components/AccountDropdown";
import { CreateTransactionMutation } from "../../mutations/DataMutations";
import { Category } from "../../types/category";

import { addTransactionScreenQuery } from "./__generated__/addTransactionScreenQuery.graphql";

const quickAmounts = [10, 20, 50, 100];

export default function AddTransactionScreen() {
  const query = useLazyLoadQuery<addTransactionScreenQuery>(
    graphql`
      query addTransactionScreenQuery {
        categories {
          id
          name
          icon
        }
        ...AccountDropdownFragment
      }
    `,
    {},
  );

  const router = useRouter();

  const [amount, setAmount] = useState("");
  const [selectedQuickAmount, setSelectedQuickAmount] = useState<
    number | undefined
  >(undefined);
  const [date, setDate] = useState(new Date());
  const [category, setCategory] = useState<Category | undefined>(undefined);
  const [subcategory, setSubcategory] = useState("");
  const [notes, setNotes] = useState("");
  const [account, setAccount] = useState<string | undefined>(undefined);
  const { back } = useNavigationUtils();

  const [commitMutation] = useMutation(CreateTransactionMutation);

  const handleAddTransaction = useCallback(() => {
    if (!amount || !category || !account) {
      Alert.alert(
        "Error",
        "Please fill in required fields (amount and category)",
      );
      return;
    }

    commitMutation({
      variables: {
        input: {
          name: `${category?.name} - ${subcategory || "General"}`,
          amount: parseFloat(amount),
          date: date.toISOString(),
          notes: notes,
          accountId: account,
          categoryId: category?.id,
          subcategory: subcategory || null,
          icon: category?.icon || "dollarsign",
          color: category?.color || "#007AFF",
        },
      },
    });

    // Here you would typically save the transaction to your data store
    Alert.alert("Success", "Transaction added successfully!", [
      {
        text: "OK",
        onPress: () => {
          // Reset form
          setAmount("");
          setSelectedQuickAmount(undefined);
          setCategory(undefined);
          setSubcategory("");
          setNotes("");
          // Navigate back to dashboard or transactions
          router.push("/(tabs)");
        },
      },
    ]);
  }, [
    amount,
    category,
    router,
    commitMutation,
    date,
    subcategory,
    notes,
    account,
  ]);

  const handleAmountChange = useCallback((text: string) => {
    setAmount(text);
    setSelectedQuickAmount(undefined);
  }, []);

  const handleQuickAmountSelect = useCallback(
    (quickAmount: number) => {
      setSelectedQuickAmount(quickAmount);
      setAmount(quickAmount.toString());
    },
    [setSelectedQuickAmount, setAmount],
  );

  const handleCategoryPress = useCallback(
    (categoryId: string) => () => {
      setCategory(query?.categories?.find((cat) => cat.id === categoryId));
    },
    [query?.categories],
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
            {query?.categories?.map((cat, index) => (
              <Button
                key={index}
                title={cat.name}
                variant={category?.id === cat.id ? "primary" : "secondary"}
                size="small"
                onPress={handleCategoryPress(cat.id)}
                style={styles.categoryButton}
              />
            ))}
          </ScrollView>
        </Section>

        {/* Subcategory Section */}
        <Section title="Subcategory">
          <Input
            placeholder="Enter subcategory"
            value={subcategory}
            onChangeText={setSubcategory}
          />
        </Section>

        {/* Account Section */}
        <Section title="Account">
          <AccountDropdown
            queryRef={query}
            selectedAccountId={account ?? undefined}
            onAccountSelect={setAccount}
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
