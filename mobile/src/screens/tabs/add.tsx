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
import { QuickSubcategoryPicker } from "../../components/QuickSubcategoryPicker";
import { CreateTransactionMutation, CreateTransferMutation } from "../../mutations/DataMutations";
import { Category } from "../../types/category";

import { addTransactionScreenQuery } from "./__generated__/addTransactionScreenQuery.graphql";

const quickAmounts = [10, 20, 50, 100];

type TransactionType = 'expense' | 'income' | 'transfer';

export default function AddTransactionScreen() {
  const query = useLazyLoadQuery<addTransactionScreenQuery>(
    graphql`
      query addTransactionScreenQuery {
        categories {
          id
          name
          icon
          subcategories {
            name
          }
        }
        ...AccountDropdownFragment
      }
    `,
    {},
  );

  const [transactionType, setTransactionType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState("");
  const [selectedQuickAmount, setSelectedQuickAmount] = useState<
    number | undefined
  >(undefined);
  const [date, setDate] = useState(new Date());
  const [category, setCategory] = useState<Category | undefined>(undefined);
  const [subcategory, setSubcategory] = useState("");
  const [notes, setNotes] = useState("");
  const [account, setAccount] = useState<string | undefined>(undefined);
  const [toAccount, setToAccount] = useState<string | undefined>(undefined);
  const { back } = useNavigationUtils();

  const [commitTransactionMutation] = useMutation(CreateTransactionMutation);
  const [commitTransferMutation] = useMutation(CreateTransferMutation);

  const handleAddTransaction = useCallback(() => {
    // Add validation for amount
    const amountValue = parseFloat(amount);
    if (isNaN(amountValue) || amountValue <= 0) {
      Alert.alert("Error", "Please enter a valid amount");
      return;
    }

    if (transactionType === 'transfer') {
      // Transfer validation
      if (!account || !toAccount) {
        Alert.alert("Error", "Please select both accounts for the transfer");
        return;
      }
      if (account === toAccount) {
        Alert.alert("Error", "Please select different accounts for the transfer");
        return;
      }

      commitTransferMutation({
        variables: {
          input: {
            name: notes || "Transfer",
            amount: amountValue,
            date: date.toISOString(),
            notes: notes,
            fromAccountId: account,
            toAccountId: toAccount,
          },
        },
        onCompleted: () => {
          Alert.alert("Success", "Transfer completed successfully!", [
            {
              text: "OK",
              onPress: () => {
                // Reset form
                setAmount("");
                setSelectedQuickAmount(undefined);
                setNotes("");
                setAccount(undefined);
                setToAccount(undefined);
              },
            },
          ]);
        },
        onError: (error) => {
          Alert.alert("Error", error.message);
        },
      });
    } else {
      // Regular transaction validation
      if (!category || !account || !subcategory) {
        Alert.alert(
          "Error",
          "Please fill in required fields (amount, category, account, and subcategory)",
        );
        return;
      }

      const sanitizedSubcategory = subcategory.trim().toLowerCase();
      const finalAmount = transactionType === 'expense' ? -amountValue : amountValue;

      commitTransactionMutation({
        variables: {
          input: {
            name: `${category?.name} - ${sanitizedSubcategory || "General"}`,
            amount: finalAmount,
            date: date.toISOString(),
            notes: notes,
            accountId: account,
            categoryId: category.id,
            subcategory: sanitizedSubcategory || null,
          },
        },
        onCompleted: () => {
          Alert.alert("Success", `${transactionType === 'expense' ? 'Expense' : 'Income'} added successfully!`, [
            {
              text: "OK",
              onPress: () => {
                // Reset form
                setAmount("");
                setSelectedQuickAmount(undefined);
                setCategory(undefined);
                setSubcategory("");
                setNotes("");
                setAccount(undefined);
              },
            },
          ]);
        },
        onError: (error) => {
          Alert.alert("Error", error.message);
        },
      });
    }
  }, [
    amount, 
    transactionType, 
    category, 
    commitTransactionMutation, 
    commitTransferMutation, 
    date, 
    subcategory, 
    notes, 
    account, 
    toAccount
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

  const getScreenTitle = () => {
    switch (transactionType) {
      case 'expense':
        return 'Add Expense';
      case 'income':
        return 'Add Income';
      case 'transfer':
        return 'Transfer Money';
      default:
        return 'Add Transaction';
    }
  };

  return (
    <ScreenContainer bottomPadding={50}>
      {/* Header */}
      <Header title={getScreenTitle()} leftIcon="xmark" onLeftPress={back} />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Transaction Type Selector */}
        <Section title="Type">
          <View style={styles.transactionTypeContainer}>
            <Button
              title="Expense"
              variant={transactionType === 'expense' ? "primary" : "secondary"}
              size="small"
              onPress={() => setTransactionType('expense')}
              style={styles.typeButton}
            />
            <Button
              title="Income"
              variant={transactionType === 'income' ? "primary" : "secondary"}
              size="small"
              onPress={() => setTransactionType('income')}
              style={styles.typeButton}
            />
            <Button
              title="Transfer"
              variant={transactionType === 'transfer' ? "primary" : "secondary"}
              size="small"
              onPress={() => setTransactionType('transfer')}
              style={styles.typeButton}
            />
          </View>
        </Section>

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

        {/* Category and Subcategory for non-transfer transactions */}
        {transactionType !== 'transfer' && (
          <>
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

            <Section title="Subcategory">
              <Input
                placeholder="Enter subcategory"
                value={subcategory}
                onChangeText={setSubcategory}
              />
              <QuickSubcategoryPicker
                subcategories={
                  category?.subcategories?.map((sub) => sub.name) || []
                }
                selectedSubcategory={subcategory}
                onSubcategorySelect={setSubcategory}
              />
            </Section>
          </>
        )}

        {/* Account Section */}
        <Section title={transactionType === 'transfer' ? "From Account" : "Account"}>
          <AccountDropdown
            queryRef={query}
            selectedAccountId={account ?? undefined}
            onAccountSelect={setAccount}
          />
        </Section>

        {/* To Account Section (only for transfers) */}
        {transactionType === 'transfer' && (
          <Section title="To Account">
            <AccountDropdown
              queryRef={query}
              selectedAccountId={toAccount ?? undefined}
              onAccountSelect={setToAccount}
            />
          </Section>
        )}

        {/* Notes Section */}
        <Section title={transactionType === 'transfer' ? "Transfer Description" : "Notes"}>
          <Input
            placeholder={
              transactionType === 'transfer' 
                ? "What is this transfer for?"
                : "Add any notes about this transaction..."
            }
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
          title={
            transactionType === 'expense' 
              ? "Add Expense"
              : transactionType === 'income'
              ? "Add Income"
              : "Transfer Money"
          }
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
  transactionTypeContainer: {
    flexDirection: "row",
    gap: 12,
  },
  typeButton: {
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
