import { BudgetSummary } from "@/types/budget-period";
import { ensureOk, fetchJsonWithAuth, fetchWithAuth } from "@/utils/api";

export const fetchBudgetSummary = async (
  year: number,
  month: number,
  currency: string,
): Promise<BudgetSummary> => {
  return fetchJsonWithAuth<BudgetSummary>(
    `/budget?year=${year}&month=${month}&currency=${currency}`,
  );
};

export const upsertAllocation = async (
  periodId: number,
  categoryId: number,
  amount: number,
): Promise<{
  id: number;
  planned_amount: number;
  transaction_category_id: number;
}> => {
  return fetchJsonWithAuth<{
    id: number;
    planned_amount: number;
    transaction_category_id: number;
  }>(`/budget/${periodId}/allocations`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      transaction_category_id: categoryId,
      planned_amount: amount,
    }),
  });
};

export const deleteAllocation = async (
  periodId: number,
  allocationId: number,
): Promise<void> => {
  const response = await fetchWithAuth(
    `/budget/${periodId}/allocations/${allocationId}`,
    { method: "DELETE" },
  );
  await ensureOk(response);
};

export const copyPreviousMonth = async (
  year: number,
  month: number,
  currency: string,
): Promise<BudgetSummary> => {
  return fetchJsonWithAuth<BudgetSummary>(
    `/budget/copy_previous?year=${year}&month=${month}&currency=${currency}`,
    { method: "POST" },
  );
};
