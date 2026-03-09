class CreateRecurringTransactions < ActiveRecord::Migration[8.0]
  def change
    create_table :recurring_transactions do |t|
      t.string :name, null: false
      t.decimal :amount, precision: 14, scale: 2, null: false
      t.string :currency, default: "CLP", null: false
      t.integer :frequency, default: 0, null: false
      t.date :start_date, null: false
      t.date :end_date
      t.date :next_due_date, null: false
      t.boolean :is_active, default: true, null: false
      t.integer :transaction_type, default: 0, null: false
      t.boolean :auto_create, default: false, null: false
      t.string :notes
      t.references :user, null: false, foreign_key: true
      t.references :transaction_category, foreign_key: true
      t.references :account, foreign_key: true
      t.timestamps
    end
  end
end
