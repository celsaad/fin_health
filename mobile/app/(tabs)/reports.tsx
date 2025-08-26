import React, { useCallback, useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";

import {
  Header,
  Section,
  Card,
  Button,
  ToggleSwitch,
  ScreenContainer,
} from "@/components/ui";
import { IconSymbol } from "@/components/ui/IconSymbol";

export default function ReportsScreen() {
  const [selectedTab, setSelectedTab] = useState("expenses");
  const [selectedMetrics, setSelectedMetrics] = useState([
    "netWorth",
    "debtToIncome",
    "savingsRate",
  ]);

  const availableMetrics = [
    { id: "netWorth", name: "Net Worth", enabled: true },
    { id: "debtToIncome", name: "Debt-to-Income Ratio", enabled: true },
    { id: "savingsRate", name: "Savings Rate", enabled: true },
    {
      id: "investmentPerformance",
      name: "Investment Performance",
      enabled: false,
    },
    { id: "monthlySpending", name: "Monthly Spending", enabled: false },
    { id: "incomeGrowth", name: "Income Growth", enabled: false },
  ];

  const netWorthData = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"];

  const toggleMetric = useCallback(
    (metricId: string) => () => {
      if (selectedMetrics.includes(metricId)) {
        setSelectedMetrics(selectedMetrics.filter(id => id !== metricId));
      } else {
        setSelectedMetrics([...selectedMetrics, metricId]);
      }
    },
    [selectedMetrics]
  );

  const handleTabPress = useCallback((tab: string) => {
    setSelectedTab(tab);
  }, []);

  const handleExpensesPress = useCallback(() => {
    handleTabPress("expenses");
  }, [handleTabPress]);

  const handleIncomePress = useCallback(() => {
    handleTabPress("income");
  }, [handleTabPress]);

  return (
    <ScreenContainer hasTabBar>
      {/* Header */}
      <Header title="Reports" leftIcon="chevron.left" rightIcon="gear" />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Tab Selector */}
        <View style={styles.tabContainer}>
          <Button
            title="Expenses"
            variant={selectedTab === "expenses" ? "primary" : "secondary"}
            onPress={handleExpensesPress}
          />
          <Button
            title="Income"
            variant={selectedTab === "income" ? "primary" : "secondary"}
            onPress={handleIncomePress}
          />
        </View>

        {/* Net Worth Card */}
        <Card padding="large" variant="flat" style={styles.netWorthCard}>
          <Text style={styles.netWorthLabel}>Net Worth</Text>
          <Text style={styles.netWorthAmount}>$50,000</Text>
        </Card>

        {/* Net Worth Trend */}
        <Section title="Net Worth Trend">
          <Card padding="large">
            <Text style={styles.trendAmount}>$50,000</Text>
            <Text style={styles.trendSubtitle}>
              Last 12 Months <Text style={styles.positiveChange}>+5%</Text>
            </Text>

            {/* Line Chart Placeholder */}
            <View style={styles.chartContainer}>
              <View style={styles.lineChart}>
                {netWorthData.map((month, index) => (
                  <View key={index} style={styles.chartPoint} />
                ))}
              </View>
              <View style={styles.chartLabels}>
                {netWorthData.map((month, index) => (
                  <Text key={index} style={styles.chartLabel}>
                    {month}
                  </Text>
                ))}
              </View>
            </View>
          </Card>
        </Section>

        {/* Assets vs Liabilities */}
        <Section title="Assets vs. Liabilities">
          <Card margin="small">
            <View style={styles.assetRow}>
              <View style={styles.assetLeft}>
                <View style={styles.assetIcon}>
                  <IconSymbol
                    name="building.columns.fill"
                    size={20}
                    color="#666"
                  />
                </View>
                <View>
                  <Text style={styles.assetTitle}>Assets</Text>
                  <Text style={styles.assetSubtitle}>Total Assets</Text>
                </View>
              </View>
              <Text style={styles.assetAmount}>$75,000</Text>
            </View>
          </Card>

          <Card margin="small">
            <View style={styles.assetRow}>
              <View style={styles.assetLeft}>
                <View style={styles.assetIcon}>
                  <IconSymbol name="creditcard.fill" size={20} color="#666" />
                </View>
                <View>
                  <Text style={styles.assetTitle}>Liabilities</Text>
                  <Text style={styles.assetSubtitle}>Total Liabilities</Text>
                </View>
              </View>
              <Text style={styles.assetAmount}>$25,000</Text>
            </View>
          </Card>
        </Section>

        {/* Financial Ratios */}
        <Section title="Financial Ratios">
          <Card margin="small">
            <View style={styles.ratioHeader}>
              <View style={styles.ratioLeft}>
                <View style={styles.ratioIcon}>
                  <IconSymbol name="chart.bar.fill" size={20} color="#666" />
                </View>
                <View>
                  <Text style={styles.ratioTitle}>Debt-to-Income</Text>
                  <Text style={styles.ratioDescription}>
                    Measures your debt relative to your income. Lower is better.
                  </Text>
                  <Text style={styles.ratioSubtitle}>Debt-to-Income Ratio</Text>
                </View>
              </View>
              <Text style={styles.ratioValue}>20%</Text>
            </View>
          </Card>

          <Card margin="small">
            <View style={styles.ratioHeader}>
              <View style={styles.ratioLeft}>
                <View style={styles.ratioIcon}>
                  <IconSymbol
                    name="arrow.up.circle.fill"
                    size={20}
                    color="#666"
                  />
                </View>
                <View>
                  <Text style={styles.ratioTitle}>Savings Rate</Text>
                  <Text style={styles.ratioDescription}>
                    Percentage of your income you save. Higher is better.
                  </Text>
                  <Text style={styles.ratioSubtitle}>Savings Rate</Text>
                </View>
              </View>
              <Text style={styles.ratioValue}>15%</Text>
            </View>
          </Card>
        </Section>

        {/* Customize Metrics */}
        <Section title="Customize Metrics">
          {availableMetrics.map((metric, index) => (
            <Card key={index} margin="small">
              <View style={styles.metricRow}>
                <Text style={styles.metricName}>{metric.name}</Text>
                <ToggleSwitch
                  value={selectedMetrics.includes(metric.id)}
                  onValueChange={toggleMetric(metric.id)}
                  size="medium"
                />
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
  tabContainer: {
    flexDirection: "row",
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: "#f0f0f0",
    borderRadius: 25,
    padding: 4,
  },
  netWorthCard: {
    backgroundColor: "#f0f0f0",
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 30,
    alignItems: "center",
  },
  netWorthLabel: {
    fontSize: 16,
    color: "#666",
    marginBottom: 8,
  },
  netWorthAmount: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#000",
  },
  trendAmount: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 4,
  },
  trendSubtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 20,
  },
  positiveChange: {
    color: "#34c759",
    fontWeight: "600",
  },
  chartContainer: {
    height: 120,
  },
  lineChart: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    height: 80,
    marginBottom: 10,
  },
  chartPoint: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#007AFF",
  },
  chartLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  chartLabel: {
    fontSize: 12,
    color: "#666",
  },
  assetRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  assetLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  assetIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  assetTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },
  assetSubtitle: {
    fontSize: 13,
    color: "#666",
    marginTop: 2,
  },
  assetAmount: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },
  ratioHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  ratioLeft: {
    flexDirection: "row",
    flex: 1,
    marginRight: 12,
  },
  ratioIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  ratioTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginBottom: 4,
  },
  ratioDescription: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
    lineHeight: 16,
  },
  ratioSubtitle: {
    fontSize: 12,
    color: "#666",
  },
  ratioValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
  },
  metricRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  metricName: {
    fontSize: 15,
    fontWeight: "500",
    color: "#000",
  },
});
