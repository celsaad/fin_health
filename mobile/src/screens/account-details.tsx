import { useLocalSearchParams } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import Detail, { DetailData } from "@/src/components/Detail";
import {
  Header,
  IconSymbol,
  ScreenContainer,
  Section,
} from "@/src/components/ui";
import { useNavigationUtils } from "@/src/hooks/useNavigationUtils";
import { AccountData } from "@/src/types/account";

import { getNumericalValueTextColor } from "../utils/getNumericalValueTextColor";

import useFormatCurrency from "@/src/hooks/useFormatCurrency";

export default function AccountDetailsScreen() {
  const { back } = useNavigationUtils();

  const { account: accountParam } = useLocalSearchParams<{
    account: string;
  }>();
  const account: AccountData = accountParam ? JSON.parse(accountParam) : null;

  const formatCurrency = useFormatCurrency();

  if (!account) {
    return null;
  }

  const accountDetails: DetailData[] = [
    {
      icon: "dollarsign.circle.fill",
      value: account.balance
        ? formatCurrency(account.balance)
        : formatCurrency(0),
      valueColor: getNumericalValueTextColor(account.balance ?? 0),
    },
  ];

  return (
    <ScreenContainer>
      <Header title="Account Details" leftIcon="xmark" onLeftPress={back} />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.accountHeader}>
          <View style={styles.accountIcon}>
            <IconSymbol name={account.icon} size={32} color="#666" />
          </View>
          <Text style={styles.accountName}>{account.name}</Text>
          <Text style={styles.accountAmount}>{account.amount}</Text>
        </View>

        <Section title="Account Details">
          {accountDetails.map((detail, index) => (
            <Detail key={index} detail={detail} />
          ))}
        </Section>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  accountHeader: {
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  accountIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  accountName: {
    fontSize: 20,
    fontWeight: "bold",
  },
  accountAmount: {
    fontSize: 20,
    fontWeight: "bold",
  },
});
