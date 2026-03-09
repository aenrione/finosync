import { View, Text, useWindowDimensions } from "react-native";
import React, { useMemo, useState } from "react";
import { BarChart } from "react-native-gifted-charts";

import { useCharts } from "@/context/charts.context";
import { colors } from "@/lib/colors";
import { getCurrencyMeta, showAmount } from "@/utils/currency";
import Icon from "@/components/ui/icon";

export default function CashFlowChart() {
  const { balanceData, avgIncome, avgExpenses, avgSavings, baseCurrency } =
    useCharts();
  const { width: screenWidth } = useWindowDimensions();
  const [containerWidth, setContainerWidth] = useState(screenWidth - 40);

  const { stackData, lineData, chartMaxValue, chartMostNegativeValue } =
    useMemo(() => {
      if (!balanceData || balanceData.length === 0) {
        return {
          stackData: [],
          lineData: [],
          chartMaxValue: 0,
          chartMostNegativeValue: 0,
        };
      }

      const stacks = balanceData.map((item) => {
        const label = item.week ?? item.month ?? "";
        const income = Number(item.income) || 0;
        const expenseMagnitude = Math.abs(Number(item.expenses) || 0);
        const expenses = -expenseMagnitude;

        return {
          stacks: [
            {
              value: income,
              color: colors.income,
              borderTopLeftRadius: 4,
              borderTopRightRadius: 4,
              borderBottomLeftRadius: 0,
              borderBottomRightRadius: 0,
            },
            {
              value: expenses,
              color: colors.expense,
              borderTopLeftRadius: 0,
              borderTopRightRadius: 0,
              borderBottomLeftRadius: 4,
              borderBottomRightRadius: 4,
            },
          ],
          label,
        };
      });

      const line = balanceData.map((item) => {
        const income = Number(item.income) || 0;
        const expenseMagnitude = Math.abs(Number(item.expenses) || 0);

        return {
          value: income - expenseMagnitude,
        };
      });

      const incomeValues = balanceData.map((item) => Number(item.income) || 0);
      const expenseValues = balanceData.map((item) =>
        Math.abs(Number(item.expenses) || 0),
      );
      const savingsValues = line.map((item) => item.value);

      const positiveMax = Math.max(0, ...incomeValues, ...savingsValues);
      const negativeMax = Math.max(0, ...expenseValues, positiveMax * 0.5);

      return {
        stackData: stacks,
        lineData: line,
        chartMaxValue: positiveMax * 1.08,
        chartMostNegativeValue: negativeMax * 1.18,
      };
    }, [balanceData]);

  if (stackData.length === 0) return null;

  const chartWidth = Math.max(220, containerWidth - 64);
  const amountSymbol = getCurrencyMeta(baseCurrency).symbol;
  const barWidth = Math.max(
    18,
    Math.min(32, chartWidth / Math.max(stackData.length, 1) - 18),
  );
  const chartEdgeSpacing = 18;
  const chartSpacing = Math.max(
    8,
    chartWidth / Math.max(stackData.length, 1) - barWidth,
  );
  const yAxisLabelWidth = 40;
  const customLabelWidth = Math.max(48, barWidth + 20);
  const labelCenterNudge = Math.min(14, chartSpacing * 0.5);
  const negativeDepthRatio =
    chartMostNegativeValue > 0
      ? chartMostNegativeValue /
        Math.max(chartMaxValue + chartMostNegativeValue, 1)
      : 0;
  const labelTopOffset = 28 + negativeDepthRatio * 28;

  return (
    <View className="mt-6">
      <View className="mb-3 flex-row items-start gap-3">
        <View className="flex-row items-center flex-1">
          <Icon name="ChartBar" className="text-primary mr-2" size={20} />
          <View>
            <Text className="text-xl font-semibold text-foreground">
              Cash Flow
            </Text>
            <Text className="text-xs text-muted-foreground">
              {baseCurrency} income above zero, expenses below
            </Text>
          </View>
        </View>
      </View>

      <View
        className="bg-card rounded-2xl border border-border p-4 pb-4"
        onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
      >
        <View className="mb-4 flex-row flex-wrap justify-end gap-3">
          <View className="flex-row items-center">
            <View
              className="mr-1.5 h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: colors.income }}
            />
            <Text className="text-xs text-muted-foreground">Income</Text>
          </View>
          <View className="flex-row items-center">
            <View
              className="mr-1.5 h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: colors.expense }}
            />
            <Text className="text-xs text-muted-foreground">Expenses</Text>
          </View>
          <View className="flex-row items-center">
            <View
              className="mr-1.5 h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: colors.foreground }}
            />
            <Text className="text-xs text-muted-foreground">Savings</Text>
          </View>
        </View>

        <BarChart
          stackData={stackData}
          width={chartWidth}
          barWidth={barWidth}
          spacing={chartSpacing}
          initialSpacing={chartEdgeSpacing}
          endSpacing={chartEdgeSpacing}
          noOfSections={4}
          maxValue={chartMaxValue || undefined}
          mostNegativeValue={chartMostNegativeValue || undefined}
          yAxisLabelWidth={yAxisLabelWidth}
          xAxisThickness={0}
          yAxisThickness={0}
          autoShiftLabelsForNegativeStacks
          xAxisLabelsAtBottom
          xAxisLabelsHeight={8}
          xAxisLabelsVerticalShift={0}
          yAxisTextStyle={{ color: colors.mutedForeground, fontSize: 10 }}
          xAxisLabelTextStyle={{ color: "transparent", fontSize: 11 }}
          formatYLabel={(label) => {
            const val = Number(label);
            if (Math.abs(val) >= 1000000)
              return `${(val / 1000000).toFixed(1)}M`;
            if (Math.abs(val) >= 1000) return `${(val / 1000).toFixed(0)}k`;
            return label;
          }}
          hideRules={false}
          rulesColor={colors.border}
          rulesType="dashed"
          showLine
          lineData={lineData}
          lineConfig={{
            color: colors.foreground,
            thickness: 3.5,
            curved: true,
            curvature: 0.12,
            hideDataPoints: false,
            dataPointsColor: colors.foreground,
            dataPointsRadius: 4,
          }}
          disableScroll
        />

        <View
          className="relative h-5"
          style={{
            marginLeft: yAxisLabelWidth,
            marginTop: labelTopOffset,
            width: chartWidth,
          }}
        >
          {stackData.map((item, index) => {
            const centerX =
              chartEdgeSpacing +
              barWidth / 2 +
              index * (barWidth + chartSpacing) +
              labelCenterNudge;

            return (
              <View
                key={`${item.label}-${index}`}
                style={{
                  position: "absolute",
                  left: centerX - customLabelWidth / 2,
                  width: customLabelWidth,
                }}
              >
                <Text
                  className="text-center text-xs text-muted-foreground"
                  numberOfLines={1}
                >
                  {item.label}
                </Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* Avg Stats Row */}
      <View className="flex-row gap-3 mt-3">
        <View className="flex-1 bg-card rounded-xl p-4 border border-border items-center">
          <Icon name="DollarSign" className="text-success mb-2" size={20} />
          <Text className="text-xs text-muted-foreground mb-1">Avg Income</Text>
          <Text className="text-base font-mono font-bold text-foreground">
            {showAmount(avgIncome, true, amountSymbol)}
          </Text>
        </View>
        <View className="flex-1 bg-card rounded-xl p-4 border border-border items-center">
          <Icon
            name="TrendingDown"
            className="text-destructive mb-2"
            size={20}
          />
          <Text className="text-xs text-muted-foreground mb-1">
            Avg Expenses
          </Text>
          <Text className="text-base font-mono font-bold text-foreground">
            {showAmount(avgExpenses, true, amountSymbol)}
          </Text>
        </View>
        <View className="flex-1 bg-card rounded-xl p-4 border border-border items-center">
          <Icon name="TrendingUp" className="text-primary mb-2" size={20} />
          <Text className="text-xs text-muted-foreground mb-1">
            Avg Savings
          </Text>
          <Text className="text-base font-mono font-bold text-foreground">
            {showAmount(avgSavings, true, amountSymbol)}
          </Text>
        </View>
      </View>
    </View>
  );
}
