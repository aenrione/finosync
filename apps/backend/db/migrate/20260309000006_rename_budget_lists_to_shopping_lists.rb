class RenameBudgetListsToShoppingLists < ActiveRecord::Migration[8.0]
  def change
    rename_table :budget_lists, :shopping_lists
    rename_table :budget_items, :shopping_items

    rename_column :shopping_items, :budget_list_id, :shopping_list_id

    rename_index :shopping_lists,
                 "index_budget_lists_on_user_id",
                 "index_shopping_lists_on_user_id"
    rename_index :shopping_items,
                 "index_budget_items_on_budget_list_id",
                 "index_shopping_items_on_shopping_list_id"
  end
end
