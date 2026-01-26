import { IconName } from "./icon"
export type Transaction = {
  id: number;
  amount: number;
  comment?: string;
  currency: string;
  description: string;
  holder_institution?: string;
  holder_name?: string;
  account_name?: string;
  account_id?: number;
  ignore?: boolean;
  post_date: string;
  transaction_date: string;
  transaction_type: "credit" | "debit";
  created_at: string;
  updated_at: string;
  fintoc_bank_account_id?: number;
  holder_id?: string;
  transaction_category_id?: number;
  category?: {
    name: string;
    id: number;
  };
  icon?: IconName
  editable?: boolean;
};
