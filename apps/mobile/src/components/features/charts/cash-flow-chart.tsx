import { View, Text, useWindowDimensions } from "react-native";
import React, { useMemo, useState } from "react";
import { BarChart } from "react-native-gifted-charts";

import { useCharts } from "@/context/charts.context";
import { colors } from "@/lib/colors";
import { showAmount } from "@/utils/currency";
import Icon from "@/components/ui/icon";

export default function CashFlowChart() {
  const { balanceData, avgIncome, avgExpenses, avgSavings } = useCharts();
  const { width: screenWidth } = useWindowDimensions();
  const [containerWidth, setContainerWidth] = useState(screenWidth - 40);

  const { barData, lineData, maxVal } = useMemo(() => {
    if (!balanceData || balanceData.length === 0) {
      return { barData: [], lineData: [], maxVal: 0 };
    }

    let max = 0;
    const bars: any[] = [];
    const line: { value: number }[] = [];

    balanceData.forEach((item) => {
      const label = (item as any).week ?? (item as any).month ?? "";
      max = Math.max(max, item.income, item.expenses);

      // Income bar (first in pair)
      bars.push({
        value: item.income,
        label,
        spacing: 4,
        labelWidth: 40,
        labelTextStyle: { color: colors.mutedForeground, fontSize: 10, textAlign: "center" },
        frontColor: colors.income,
        barBorderTopLeftRadius: 4,
        barBorderTopRightRadius: 4,
      });

      // Expense bar (second in pair)
      bars.push({
        value: item.expenses,
        frontColor: colors.expense,
        barBorderTopLeftRadius: 4,
        barBorderTopRightRadius: 4,
      });

      // Savings line point
      line.push({ value: Math.max(0, item.net) });
    });

    return { barData: bars, lineData: line, maxVal: max };
  }, [balanceData]);

  if (barData.length === 0) return null;

  const chartWidth = containerWidth - 50;
  const groupCount = balanceData.length;
  const barWidth = Math.max(12, Math.min(24, (chartWidth / groupCount - 20) / 2));

  return (
    <View className="mt-6">
      <View className="flex-row items-center mb-3">
        <Icon name="ChartBar" className="text-primary mr-2" size={20} />
        <Text className="text-xl font-semibold text-foreground">
          Cash Flow
        </Text>
      </View>

      <View
        className="bg-card rounded-2xl border border-border p-4 pb-2"
        onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
      >
        <BarChart
          data={barData}
          width={chartWidth}
          barWidth={barWidth}
          spacing={Math.max(8, chartWidth / groupCount - barWidth * 2 - 4)}
          initialSpacing={10}
          endSpacing={10}
          noOfSections={4}
          maxValue={maxVal * 1.1}
          xAxisThickness={0}
          yAxisThickness={0}
          yAxisTextStyle={{ color: colors.mutedForeground, fontSize: 10 }}
          formatYLabel={(label) => {
            const val = Number(label);
            if (Math.abs(val) >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
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
            thickness: 2.5,
            curved: true,
            hideDataPoints: false,
            dataPointsColor: colors.foreground,
            dataPointsRadius: 3,
          }}
          disableScroll
        />

        {/* Legend */}
        <View className="flex-row gap-4 mt-3 mb-1 justify-center">
          <View className="flex-row items-center">
            <View className="w-2.5 h-2.5 rounded-full mr-1.5" style={{ backgroundColor: colors.income }} />
            <Text className="text-xs text-muted-foreground">Income</Text>
          </View>
          <View className="flex-row items-center">
            <View className="w-2.5 h-2.5 rounded-full mr-1.5" style={{ backgroundColor: colors.expense }} />
            <Text className="text-xs text-muted-foreground">Expenses</Text>
          </View>
          <View className="flex-row items-center">
            <View className="w-2.5 h-2.5 rounded-full mr-1.5" style={{ backgroundColor: colors.foreground }} />
            <Text className="text-xs text-muted-foreground">Savings</Text>
          </View>
        </View>
      </View>

      {/* Avg Stats Row */}
      <View className="flex-row gap-3 mt-3">
        <View className="flex-1 bg-card rounded-xl p-4 border border-border items-center">
          <Icon name="DollarSign" className="text-success mb-2" size={20} />
          <Text className="text-xs text-muted-foreground mb-1">Avg Income</Text>
          <Text className="text-base font-mono font-bold text-foreground">
            {showAmount(avgIncome)}
          </Text>
        </View>
        <View className="flex-1 bg-card rounded-xl p-4 border border-border items-center">
          <Icon name="TrendingDown" className="text-destructive mb-2" size={20} />
          <Text className="text-xs text-muted-foreground mb-1">Avg Expenses</Text>
          <Text className="text-base font-mono font-bold text-foreground">
            {showAmount(avgExpenses)}
          </Text>
        </View>
        <View className="flex-1 bg-card rounded-xl p-4 border border-border items-center">
          <Icon name="TrendingUp" className="text-primary mb-2" size={20} />
          <Text className="text-xs text-muted-foreground mb-1">Avg Savings</Text>
          <Text className="text-base font-mono font-bold text-foreground">
            {showAmount(avgSavings)}
          </Text>
        </View>
      </View>
    </View>
  );
}
