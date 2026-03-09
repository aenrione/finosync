import { View, Text, useWindowDimensions, Pressable } from "react-native";
import React, { useMemo, useState, useCallback, useEffect, useRef } from "react";
import { BarChart } from "react-native-gifted-charts";

import { useCharts } from "@/context/charts.context";
import { colors } from "@/lib/colors";
import Icon from "@/components/ui/icon";

const GREY_INCOME = "#B0BEC5";
const GREY_EXPENSE = "#78909C";

export default function CashFlowChart() {
  const { balanceData, baseCurrency, timeRange, setSelectedPeriods } =
    useCharts();
  const { width: screenWidth } = useWindowDimensions();
  const [containerWidth, setContainerWidth] = useState(screenWidth - 40);
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());
  const initializedRef = useRef(false);

  // Reset default selection when time range changes
  useEffect(() => {
    initializedRef.current = false;
    setSelectedIndices(new Set());
  }, [timeRange]);

  // Auto-select the current month (last bar) when data loads
  useEffect(() => {
    if (balanceData.length > 0 && !initializedRef.current) {
      initializedRef.current = true;
      const lastIndex = balanceData.length - 1;
      setSelectedIndices(new Set([lastIndex]));
      const period = balanceData[lastIndex]?.week ?? balanceData[lastIndex]?.month ?? "";
      if (period) setSelectedPeriods([period]);
    }
  }, [balanceData, setSelectedPeriods]);

  const hasSelection = selectedIndices.size > 0;

  const handleBarPress = useCallback((index: number) => {
    setSelectedIndices((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      const periods = [...next]
        .map((i) => balanceData[i]?.week ?? balanceData[i]?.month ?? "")
        .filter(Boolean);
      setSelectedPeriods(periods);
      return next;
    });
  }, [balanceData, setSelectedPeriods]);

  const clearSelection = useCallback(() => {
    setSelectedIndices(new Set());
    setSelectedPeriods([]);
  }, [setSelectedPeriods]);

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

      const stacks = balanceData.map((item, index) => {
        const label = item.week ?? item.month ?? "";
        const income = Number(item.income) || 0;
        const expenseMagnitude = Math.abs(Number(item.expenses) || 0);
        const expenses = -expenseMagnitude;

        const isSelected = !hasSelection || selectedIndices.has(index);
        const incomeColor = isSelected ? colors.income : GREY_INCOME;
        const expenseColor = isSelected ? colors.expense : GREY_EXPENSE;

        return {
          stacks: [
            {
              value: income,
              color: incomeColor,
              borderTopLeftRadius: 4,
              borderTopRightRadius: 4,
              borderBottomLeftRadius: 0,
              borderBottomRightRadius: 0,
              onPress: () => handleBarPress(index),
            },
            {
              value: expenses,
              color: expenseColor,
              borderTopLeftRadius: 0,
              borderTopRightRadius: 0,
              borderBottomLeftRadius: 4,
              borderBottomRightRadius: 4,
              onPress: () => handleBarPress(index),
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
    }, [balanceData, hasSelection, selectedIndices, handleBarPress]);

  if (stackData.length === 0) return null;

  const chartWidth = Math.max(220, containerWidth - 64);
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

        {hasSelection && (() => {
          const indices = [...selectedIndices].sort((a, b) => a - b);
          const labels = indices
            .map((i) => balanceData[i]?.week ?? balanceData[i]?.month)
            .filter(Boolean);

          return (
            <Pressable
              onPress={clearSelection}
              className="mb-3 flex-row items-center justify-between rounded-xl border border-primary/20 bg-primary/5 px-3 py-2"
            >
              <View className="flex-row items-center gap-2 flex-1">
                <Icon name="ListFilter" className="text-primary" size={14} />
                <Text className="text-xs font-medium text-foreground" numberOfLines={1}>
                  {labels.join(", ")}
                </Text>
              </View>
              <Icon name="X" className="text-muted-foreground" size={14} />
            </Pressable>
          );
        })()}

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
            color: hasSelection ? colors.border : colors.foreground,
            thickness: 3.5,
            curved: true,
            curvature: 0.12,
            hideDataPoints: false,
            dataPointsColor: hasSelection ? colors.border : colors.foreground,
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

    </View>
  );
}
