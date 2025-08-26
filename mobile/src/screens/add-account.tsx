import { useCallback, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useMutation } from "react-relay";

import {
  Button,
  Header,
  Input,
  ScreenContainer,
  Section,
} from "@/src/components/ui";
import { useNavigationUtils } from "@/src/hooks/useNavigationUtils";
import { CreateAccountMutation } from "@/src/mutations/DataMutations";

import { AccountType } from "../types/account";

const accountTypes = [
  { id: "CHECKING", name: "Checking", icon: "building.columns.fill" },
  { id: "SAVINGS", name: "Savings", icon: "banknote.fill" },
  { id: "CREDIT_CARD", name: "Credit Card", icon: "creditcard.fill" },
  { id: "INVESTMENT", name: "Investment", icon: "dollarsign.circle.fill" },
  { id: "LOAN", name: "Loan", icon: "dollarsign.circle.fill" },
];

export default function AddAccountScreen() {
  const [accountName, setAccountName] = useState("");
  const [accountType, setAccountType] = useState<AccountType>("CHECKING");
  const { back } = useNavigationUtils();

  const [commitMutation] = useMutation(CreateAccountMutation);

  const handleAddAccount = useCallback(() => {
    commitMutation({
      variables: {
        input: {
          name: accountName,
          type: accountType,
          icon: accountTypes.find((type) => type.id === accountType)?.icon,
        },
      },
      onCompleted: () => {
        console.log("Account created");
        back();
      },
      onError: (error) => {
        console.error("Error creating account", error);
      },
    });
  }, [accountName, accountType, back, commitMutation]);

  const handleAccountTypePress = useCallback((type: string) => {
    setAccountType(type);
  }, []);

  return (
    <ScreenContainer>
      <Header title="Add Account" leftIcon="xmark" onLeftPress={back} />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <Section title="Account Name">
          <Input
            placeholder="Account Name"
            value={accountName}
            onChangeText={setAccountName}
          />
        </Section>

        <Section title="Account Type">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoriesContainer}
          >
            {accountTypes.map((cat, index) => (
              <Button
                key={index}
                title={cat.name}
                icon={cat.icon}
                variant={accountType === cat.id ? "primary" : "secondary"}
                size="small"
                onPress={() => handleAccountTypePress(cat.id)}
                style={styles.categoryButton}
              />
            ))}
          </ScrollView>
        </Section>

        <View style={styles.buttonContainer}>
          <Button
            title="Add Account"
            variant="primary"
            size="large"
            fullWidth
            onPress={handleAddAccount}
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
  buttonContainer: {
    padding: 16,
  },
  categoriesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  categoryButton: {
    flex: 1,
  },
});
