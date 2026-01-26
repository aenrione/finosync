class CreateTransactionCategories < ActiveRecord::Migration[6.0]
  def change
    create_table :transaction_categories do |t|
      t.string :name
      t.text :description
      t.references :user, null: false, foreign_key: true
      t.string :icon, default: "FileQuestion"

      t.timestamps
    end
  end
end
