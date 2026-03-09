import { View, Text, useWindowDimensions } from "react-native";
import React, { useMemo, useState } from "react";
import { BarChart } from "react-native-gifted-charts";

import { useCharts } from "@/context/charts.context";
import { colors } from "@/lib/colors";
import Icon from "@/components/ui/icon";

const TYPE_CONFIG: Record<string, { label: string; color: string }> = {
  local: { label: "Cash", color: colors.income },
  fintoc: { label: "Banking", color: colors.accountFintoc },
  fintual: { label: "Investments", color: colors.investment },
  buda: { label: "Crypto", color: colors.crypto },
};

export default function NetWorthChart() {
  const { accountBalances, loading } = useCharts();
  const { width: screenWidth } = useWindowDimensions();
  const [containerWidth, setContainerWidth] = useState(screenWidth - 40);

  const { stackData, lineData, typeKeys } = useMemo(() => {
    if (!accountBalances || accountBalances.length === 0) {
      return { stackData: [], lineData: [], typeKeys: [] };
    }

    const refLabels = accountBalances[0]?.labels || [];

    // Group accounts by type, sum their data arrays
    const grouped: Record<string, number[]> = {};
    for (const acct of accountBalances) {
      const type = acct.account_type || "local";
      if (!grouped[type]) {
        grouped[type] = new Array(refLabels.length).fill(0);
      }
      acct.data.forEach((val, i) => {
        grouped[type][i] += val;
      });
    }

    const keys = Object.keys(grouped).filter((k) => TYPE_CONFIG[k]);

    // Build stackData for each month
    const stacks = refLabels.map((label, i) => ({
      stacks: keys.map((type) => ({
        value: Math.abs(grouped[type][i]),
        color: TYPE_CONFIG[type].color,
      })),
      label,
    }));

    // Net worth line = sum of all types per month
    const line = refLabels.map((_, i) => {
      const total = keys.reduce((sum, type) => sum + grouped[type][i], 0);
      return { value: total };
    });

    return { stackData: stacks, lineData: line, typeKeys: keys };
  }, [accountBalances]);

  if (loading || stackData.length === 0) return null;

  const chartWidth = containerWidth - 50;
  const barWidth = Math.max(16, chartWidth / stackData.length - 20);

  return (
    <View className="px-5 mt-2 mb-2">
      <View className="flex-row items-center mb-3">
        <Icon name="TrendingUp" className="text-primary mr-2" size={20} />
        <Text className="text-lg font-semibold text-foreground">
          Net Worth Trend
        </Text>
      </View>
      <View
        className="bg-card rounded-2xl border border-border p-4 pb-2"
        onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
      >
        <BarChart
          stackData={stackData}
          width={chartWidth}
          barWidth={barWidth}
          spacing={Math.max(8, chartWidth / stackData.length - barWidth)}
          initialSpacing={10}
          endSpacing={10}
          noOfSections={4}
          barBorderTopLeftRadius={4}
          barBorderTopRightRadius={4}
          xAxisThickness={0}
          yAxisThickness={0}
          yAxisTextStyle={{ color: colors.mutedForeground, fontSize: 10 }}
          xAxisLabelTextStyle={{ color: colors.mutedForeground, fontSize: 11 }}
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
        <View className="flex-row flex-wrap gap-3 mt-3 mb-1 justify-center">
          {typeKeys.map((type) => (
            <View key={type} className="flex-row items-center">
              <View
                className="w-2.5 h-2.5 rounded-full mr-1.5"
                style={{ backgroundColor: TYPE_CONFIG[type].color }}
              />
              <Text className="text-xs text-muted-foreground">
                {TYPE_CONFIG[type].label}
              </Text>
            </View>
          ))}
          <View className="flex-row items-center">
            <View
              className="w-2.5 h-2.5 rounded-full mr-1.5"
              style={{ backgroundColor: colors.foreground }}
            />
            <Text className="text-xs text-muted-foreground">Net Worth</Text>
          </View>
        </View>
      </View>
    </View>
  );
}
