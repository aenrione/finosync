class CreateBudgetLists < ActiveRecord::Migration[8.0]
  def change
    create_table :budget_lists do |t|
      t.string :title
      t.string :description
      t.decimal :total_budget, precision: 14, scale: 2, null: false, default: 0
      t.date :start_date
      t.date :end_date
      t.references :user,           null: false, foreign_key: true

      t.timestamps
    end
  end
end
