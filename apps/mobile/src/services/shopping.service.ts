import {
  ShoppingItemFormData,
  ShoppingItemUpdateData,
  ShoppingList,
  ShoppingListFormData,
} from "@/types/shopping";
import { fetchWithAuth } from "@/utils/api";
import {
  normalizeShoppingItem,
  normalizeShoppingList,
  normalizeShoppingLists,
} from "@/utils/normalizers";

const ensureOk = async (response: Response) => {
  if (response.ok) return;

  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    const errorData = await response.json();
    throw new Error(
      errorData.error || `HTTP ${response.status}: ${response.statusText}`,
    );
  }

  throw new Error(`HTTP ${response.status}: ${response.statusText}`);
};

export const fetchShoppingLists = async (): Promise<ShoppingList[]> => {
  const response = await fetchWithAuth("/shopping_lists");
  await ensureOk(response);
  const data = await response.json();
  return normalizeShoppingLists(Array.isArray(data) ? data : []);
};

export const fetchShoppingList = async (
  id: string | number,
): Promise<ShoppingList> => {
  const response = await fetchWithAuth(`/shopping_lists/${id}`);
  await ensureOk(response);
  const data = await response.json();
  return normalizeShoppingList(data);
};

export const createShoppingList = async (
  data: ShoppingListFormData,
): Promise<ShoppingList> => {
  const response = await fetchWithAuth("/shopping_lists", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  await ensureOk(response);
  const shoppingList = await response.json();
  return normalizeShoppingList(shoppingList);
};

export const updateShoppingList = async (
  id: string | number,
  data: Partial<ShoppingListFormData>,
): Promise<ShoppingList> => {
  const response = await fetchWithAuth(`/shopping_lists/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  await ensureOk(response);
  const shoppingList = await response.json();
  return normalizeShoppingList(shoppingList);
};

export const createShoppingItem = async (
  shoppingListId: string | number,
  data: ShoppingItemFormData,
) => {
  const response = await fetchWithAuth(
    `/shopping_lists/${shoppingListId}/item`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    },
  );

  await ensureOk(response);
  const item = await response.json();
  return normalizeShoppingItem(item);
};

export const updateShoppingItem = async (
  shoppingListId: string | number,
  itemId: number,
  data: ShoppingItemUpdateData,
) => {
  const response = await fetchWithAuth(
    `/shopping_lists/${shoppingListId}/item/${itemId}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    },
  );

  await ensureOk(response);
  const item = await response.json();
  return normalizeShoppingItem(item);
};

export const deleteShoppingItem = async (
  shoppingListId: string | number,
  itemId: number,
) => {
  const response = await fetchWithAuth(
    `/shopping_lists/${shoppingListId}/item/${itemId}`,
    {
      method: "DELETE",
    },
  );

  await ensureOk(response);
};
