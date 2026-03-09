# == Schema Information
#
# Table name: shopping_items
#
#  id               :integer          not null, primary key
#  description      :string
#  price            :decimal(14, 2)
#  purchase_date    :date
#  purchased        :boolean          default(FALSE)
#  source_href      :string
#  title            :string
#  created_at       :datetime         not null
#  updated_at       :datetime         not null
#  shopping_list_id :integer          not null
#  transaction_id   :integer
#
# Indexes
#
#  index_shopping_items_on_shopping_list_id  (shopping_list_id)
#  index_shopping_items_on_transaction_id    (transaction_id)
#
# Foreign Keys
#
#  shopping_list_id  (shopping_list_id => shopping_lists.id)
#  transaction_id    (transaction_id => transactions.id)
#
require 'rails_helper'

RSpec.describe ShoppingItem, type: :model do
  pending "add some examples to (or delete) #{__FILE__}"
end
