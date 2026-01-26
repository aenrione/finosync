import { Transaction } from "@/types/transaction"

export const transactionMock: Transaction = {
  "id": 1,
  "amount": 100,
  "comment": "Test transaction comment",
  "currency": "USD",
  "description": "Test transaction description",
  "holder_institution": "Test Bank",
  "holder_name": "John Doe",
  "ignore": false,
  "post_date": "2023-10-01",
  "transaction_date": "2023-10-01",
  "transaction_type": "credit",
  "created_at": "2023-10-01T12:00:00Z",
  "updated_at": "2023-10-01T12:00:00Z",
  "fintoc_bank_account_id": 1,
  "holder_id": "1234567890",
  "transaction_category_id": 1,
  "category": {
    "name": "Groceries",
    "id": 1
  }
}

export const mockTransactions: Transaction[] = Array(10).fill([transactionMock]).flat().map((_, index) => ({
  "id": index + 1,
  "amount": Math.floor(Math.random() * 1000) + 1,
  "account_name": `Account ${index + 1}`,
  "comment": `Transaction comment ${index + 1}`,
  "currency": "USD",
  "description": `Transaction description ${index + 1}`,
  "holder_institution": `Bank ${index + 1}`,
  "holder_name": `Holder ${index + 1}`,
  "ignore": false,
  "post_date": new Date().toISOString().split("T")[0],
  "transaction_date": new Date().toISOString().split("T")[0],
  "transaction_type": Math.random() > 0.5 ? "credit" : "debit",
  "created_at": new Date().toISOString(),
  "updated_at": new Date().toISOString(),
  "fintoc_bank_account_id": index + 1,
  "holder_id": `holder-${index + 1}`,
  "transaction_category_id": index + 1,
  "category": {
    "name": `Category ${index + 1}`,
    "id": index + 1
  },
  "icon": index % 2 === 0 ? "ShoppingCart" : "CreditCard"
}))
