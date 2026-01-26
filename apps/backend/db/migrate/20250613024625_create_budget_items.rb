class CreateBudgetItems < ActiveRecord::Migration[8.0]
  def change
    create_table :budget_items do |t|
      t.string :title
      t.string :description
      t.decimal :price, precision: 14, scale: 2
      t.date :purchase_date
      t.boolean :purchased, default: false
      t.string :source_href, null: true

      t.references :budget_list,           null: false, foreign_key: true

      t.timestamps
    end
  end
end
