class AddOnboardingFieldsToUsers < ActiveRecord::Migration[8.0]
  def up
    add_column :users, :preferred_currency, :string, default: nil
    add_column :users, :monthly_income, :decimal, precision: 14, scale: 2, default: 0.0
    add_column :users, :financial_goals, :text, default: nil
    add_column :users, :onboarding_completed, :boolean, default: false

    # Existing users should skip onboarding
    User.update_all(onboarding_completed: true)
  end

  def down
    remove_column :users, :preferred_currency
    remove_column :users, :monthly_income
    remove_column :users, :financial_goals
    remove_column :users, :onboarding_completed
  end
end
