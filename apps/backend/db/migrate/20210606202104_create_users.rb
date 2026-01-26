class CreateUsers < ActiveRecord::Migration[8.0]
  def change
    create_table :users do |t|
      t.string :email_address, null: false
      t.string :name, null: false
      t.string :password_digest, null: false

      t.decimal :balance, precision: 14, scale: 2, default: 0.0
      t.decimal :income, precision: 14, scale: 2, default: 0.0
      t.decimal :expense, precision: 14, scale: 2, default: 0.0
      t.decimal :investments_return, precision: 14, scale: 2, default: 0.0
      t.decimal :quota, precision: 14, scale: 2, default: 0.0

      t.timestamps
    end
    add_index :users, :email_address, unique: true
  end
end
