class AddCategoryGroupToTransactionCategories < ActiveRecord::Migration[8.0]
  def change
    add_reference :transaction_categories, :category_group, foreign_key: true, null: true
    add_column :transaction_categories, :is_income, :boolean, default: false
  end
end
