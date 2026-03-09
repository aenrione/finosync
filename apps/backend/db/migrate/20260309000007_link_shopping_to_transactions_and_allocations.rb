class LinkShoppingToTransactionsAndAllocations < ActiveRecord::Migration[8.0]
  def change
    add_reference :shopping_lists, :budget_allocation, foreign_key: true
    add_reference :shopping_items, :transaction, foreign_key: true
  end
end
