import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { Alert } from "react-native";
import { useMutation, useQueryClient } from "react-query";

import { ShoppingItemForm } from "@/components/features/shopping/shopping-item-form";
import { ShoppingItemFormData } from "@/types/shopping";
import { createShoppingItem } from "@/services/shopping.service";

export default function AddShoppingItemScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (item: ShoppingItemFormData) => createShoppingItem(id, item),
    onSuccess: async () => {
      await queryClient.invalidateQueries(["shopping-list", id]);
      await queryClient.invalidateQueries(["shopping-lists"]);
      router.replace({
        pathname: "/(app)/shopping/[id]",
        params: { id: id?.toString() },
      });
    },
    onError: (error) => {
      Alert.alert(
        "Error",
        error instanceof Error
          ? error.message
          : "Could not save the shopping item.",
      );
    },
  });

  const handleSave = (item: ShoppingItemFormData) => {
    mutation.mutate(item);
  };

  const handleCancel = () => {
    router.back();
  };

  return <ShoppingItemForm onSave={handleSave} onCancel={handleCancel} />;
}
