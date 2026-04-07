class AddSessionFieldsToAccounts < ActiveRecord::Migration[8.0]
  def change
    add_column :accounts, :session_token, :string
    add_column :accounts, :session_expires_at, :datetime
  end
end
