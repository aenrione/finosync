class CreateTransactions < ActiveRecord::Migration[6.0]
  def change
    create_table :transactions do |t|
      t.decimal :amount, precision: 14, scale: 2
      t.text :comment
      t.string :currency
      t.string :description
      t.string :transaction_id
      t.date :post_date
      t.date :transaction_date
      t.string :transaction_type
      t.string :holder_id
      t.string :holder_name
      t.string :holder_institution
      t.boolean :ignore, default: false
      t.references :account, null: true, foreign_key: true
      t.references :transaction_category, null: true, foreign_key: true

      t.timestamps
    end
  end
end
