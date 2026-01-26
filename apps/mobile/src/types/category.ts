import { IconName } from "./icon"

export type Category = {
  id: number;
  name: string;
  description?: string;
  currency_symbol?: string;
  icon?: IconName;
  transaction_count?: number;
  total_amount?: number;
  is_active?: boolean;
}
