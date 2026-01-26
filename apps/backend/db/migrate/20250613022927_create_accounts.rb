class CreateAccounts < ActiveRecord::Migration[8.0]
  def change
    create_table :accounts do |t|
      t.string :secret, null: false
      t.string :primary_key,               null: false
      t.string :currency, null: false, default: "CLP"
      t.string :account_name,       null: false, default: "Local"
      t.decimal :balance,           null: false,  precision: 14, scale: 2, default: 0
      t.references :user,           null: false, foreign_key: true
      t.timestamps null: false

      t.decimal :income, precision: 14, scale: 2, default: 0
      t.decimal :expense, precision: 14, scale: 2, default: 0
      t.decimal :investments_return, precision: 14, scale: 2, default: 0
      t.integer :account_type, null: false, default: 0
    end
  end
end
