import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";

import BudgetScreen from "@/components/features/budget/budget-screen";
import ScreenHeader from "@/components/screen-header";

export default function BudgetTabScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScreenHeader variant="drawer" title="Budget" />
      <BudgetScreen />
    </SafeAreaView>
  );
}
