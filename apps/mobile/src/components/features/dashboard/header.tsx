import React from "react"

import { useDashboard } from "@/context/dashboard.context"
import { useAccounts } from "@/context/accounts.context"
import ScreenHeader from "@/components/screen-header"
import { useCharts } from "@/context/charts.context"
import { useStore } from "@/utils/store"

import { useTranslation } from "./_texts/text"

export default function DashboardHeader() {
  const text = useTranslation()
  const { refresh } = useDashboard()
  const { refreshData: refreshCharts } = useCharts()
  const { refreshData: refreshAccounts } = useAccounts()
  const isVisible = useStore((state) => state.isVisible)
  const toggleVisibility = useStore((state) => state.toggleVisibility)

  const handleRefresh = () => {
    void refresh()
    void refreshCharts()
    void refreshAccounts()
  }

  return (
    <ScreenHeader
      variant="drawer"
      title={text.home}
      rightActions={[
        {
          icon: "RefreshCw",
          onPress: handleRefresh,
        },
        {
          icon: isVisible ? "EyeOff" : "Eye",
          onPress: toggleVisibility,
        },
      ]}
    />
  )
}
