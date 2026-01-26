import { UserBalanceChart } from "@/types/charts"

export const mockUserBalanceChart: UserBalanceChart = {
  user: {
    labels: [],
    data: [100000, 120000, 110000],
    dates: ["2025-06-01", "2025-06-02", "2025-06-03"],
    formated_data: ["$1,000.00", "$1,200.00", "$1,100.00"],
    formatted_dates: ["01 Jun", "02 Jun", "03 Jun"],
  },
  fintoc_account: {
    labels: [],
    data: [50000, 55000, 60000],
    dates: ["2025-06-01", "2025-06-02", "2025-06-03"],
    formated_data: ["$500.00", "$550.00", "$600.00"],
    formatted_dates: ["01 Jun", "02 Jun", "03 Jun"],
  },
  buda_account: {
    labels: [],
    data: [30000, 31000, 32000],
    dates: ["2025-06-01", "2025-06-02", "2025-06-03"],
    formated_data: ["$300.00", "$310.00", "$320.00"],
    formatted_dates: ["01 Jun", "02 Jun", "03 Jun"],
  },
  fintual_account: {
    labels: [],
    data: [20000, 25000, 27000],
    dates: ["2025-06-01", "2025-06-02", "2025-06-03"],
    formated_data: ["$200.00", "$250.00", "$270.00"],
    formatted_dates: ["01 Jun", "02 Jun", "03 Jun"],
  },
}

