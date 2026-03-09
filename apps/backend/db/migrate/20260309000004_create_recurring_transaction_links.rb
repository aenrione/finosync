class CreateRecurringTransactionLinks < ActiveRecord::Migration[8.0]
  def change
    create_table :recurring_transaction_links do |t|
      t.references :recurring_transaction, null: false, foreign_key: true
      t.references :transaction, null: false, foreign_key: true
      t.timestamps
    end

    add_index :recurring_transaction_links,
              [:recurring_transaction_id, :transaction_id],
              unique: true, name: "idx_recurring_tx_links_unique"
  end
end
