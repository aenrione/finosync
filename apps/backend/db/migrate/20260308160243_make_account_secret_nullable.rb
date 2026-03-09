class MakeAccountSecretNullable < ActiveRecord::Migration[8.0]
  def change
    change_column_null :accounts, :secret, true
  end
end
