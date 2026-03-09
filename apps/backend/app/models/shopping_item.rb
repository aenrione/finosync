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
class ShoppingItem < ApplicationRecord
  belongs_to :shopping_list
  belongs_to :linked_transaction,
             class_name: "Transaction",
             foreign_key: :transaction_id,
             optional: true
  monetize :price, as: "price_amount"

  before_validation :sync_purchase_state_from_transaction
  validate :transaction_belongs_to_list_user

  private

  def sync_purchase_state_from_transaction
    if linked_transaction.present?
      self.purchased = true
      self.purchase_date ||= linked_transaction.transaction_date
      return
    end

    return unless will_save_change_to_transaction_id? && transaction_id.blank?

    self.purchased = false
    self.purchase_date = nil
  end

  def transaction_belongs_to_list_user
    return if linked_transaction.blank?
    return if shopping_list.blank?
    return if linked_transaction.account.user_id == shopping_list.user_id

    errors.add(:transaction, "must belong to the current user")
  end
end
