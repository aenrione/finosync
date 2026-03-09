import React from "react";
import { TouchableOpacity, View } from "react-native";

import Icon from "@/components/ui/icon";
import { Text } from "@/components/ui/text";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

type Props = {
  year: number;
  month: number;
  onChange: (year: number, month: number) => void;
};

export default function BudgetMonthNav({ year, month, onChange }: Props) {
  const goPrev = () => {
    if (month === 1) {
      onChange(year - 1, 12);
    } else {
      onChange(year, month - 1);
    }
  };

  const goNext = () => {
    if (month === 12) {
      onChange(year + 1, 1);
    } else {
      onChange(year, month + 1);
    }
  };

  const goToday = () => {
    const now = new Date();
    onChange(now.getFullYear(), now.getMonth() + 1);
  };

  const isCurrentMonth =
    year === new Date().getFullYear() && month === new Date().getMonth() + 1;

  return (
    <View className="flex-row items-center justify-between px-5 py-3">
      <TouchableOpacity onPress={goPrev} hitSlop={12}>
        <Icon name="ChevronLeft" size={22} className="text-foreground" />
      </TouchableOpacity>

      <TouchableOpacity onPress={goToday} disabled={isCurrentMonth}>
        <Text className="text-base font-semibold text-foreground">
          {MONTH_NAMES[month - 1]} {year}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={goNext} hitSlop={12}>
        <Icon name="ChevronRight" size={22} className="text-foreground" />
      </TouchableOpacity>
    </View>
  );
}
