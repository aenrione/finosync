# == Schema Information
#
# Table name: shopping_lists
#
#  id                   :integer          not null, primary key
#  description          :string
#  end_date             :date
#  start_date           :date
#  title                :string
#  total_budget         :decimal(14, 2)   default(0.0), not null
#  created_at           :datetime         not null
#  updated_at           :datetime         not null
#  budget_allocation_id :integer
#  user_id              :integer          not null
#
# Indexes
#
#  index_shopping_lists_on_budget_allocation_id  (budget_allocation_id)
#  index_shopping_lists_on_user_id               (user_id)
#
# Foreign Keys
#
#  budget_allocation_id  (budget_allocation_id => budget_allocations.id)
#  user_id               (user_id => users.id)
#
require 'rails_helper'

RSpec.describe ShoppingList, type: :model do
  pending "add some examples to (or delete) #{__FILE__}"
end
