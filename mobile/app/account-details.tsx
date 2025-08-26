import { useLocalSearchParams } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import {
  Card,
  Header,
  IconSymbol,
  ScreenContainer,
  Section,
} from "@/components/ui";
import { useNavigationUtils } from "@/hooks/useNavigationUtils";
import { AccountData } from "@/types/account";

export default function AccountDetailsScreen() {
  const { back } = useNavigationUtils();

  const { account: accountParam } = useLocalSearchParams<{
    account: string;
  }>();
  const account: AccountData = accountParam
    ? JSON.parse(accountParam)
    : {
        id: "1",
        name: "Checking",
        amount: "$1,234.56",
        icon: "building.columns.fill",
      };

  const accountDetails = [
    {
      icon: "dollarsign.circle.fill",
      label: "Amount",
      value: account.amount,
      valueColor: account.amount > 0 ? "#34c759" : "#ff3b30",
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
            <Card key={index} margin="small">
              <View style={styles.detailContent}>
                <View style={styles.detailIcon}>
                  <IconSymbol name={detail.icon} size={20} color="#666" />
                </View>
                <View>
                  <Text
                    style={[styles.detailValue, { color: detail.valueColor }]}
                    numberOfLines={1}
                  >
                    {detail.value}
                  </Text>
                  <Text style={styles.detailLabel}>{detail.label}</Text>
                </View>
              </View>
            </Card>
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
});
