class CreateBudgetPeriodsAndAllocations < ActiveRecord::Migration[8.0]
  def change
    create_table :budget_periods do |t|
      t.references :user, null: false, foreign_key: true
      t.integer :year, null: false
      t.integer :month, null: false
      t.integer :status, default: 0, null: false
      t.timestamps
    end
    add_index :budget_periods, [ :user_id, :year, :month ], unique: true

    create_table :budget_allocations do |t|
      t.references :budget_period, null: false, foreign_key: true
      t.references :transaction_category, null: false, foreign_key: true
      t.decimal :planned_amount, precision: 14, scale: 2, default: 0.0, null: false
      t.decimal :rollover_in, precision: 14, scale: 2, default: 0.0
      t.string :notes
      t.timestamps
    end
    add_index :budget_allocations, [ :budget_period_id, :transaction_category_id ],
              unique: true, name: "idx_allocations_period_category"
  end
end
