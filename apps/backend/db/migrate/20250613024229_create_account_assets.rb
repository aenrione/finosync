class CreateAccountAssets < ActiveRecord::Migration[8.0]
  def change
    create_table :account_assets do |t|
      t.string :name, null: false
      t.date :creation_date
      t.decimal :current, precision: 14, scale: 2
      t.decimal :profit, precision: 14, scale: 2
      t.decimal :pending, precision: 14, scale: 2
      t.decimal :frozen_asset, precision: 14, scale: 2
      t.decimal :deposited, precision: 14, scale: 2
      t.string :currency, null: false, default: "CLP"
      t.references :account, null: true, foreign_key: true

      t.timestamps
    end
  end
end
