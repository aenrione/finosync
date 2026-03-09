# == Schema Information
#
# Table name: transaction_categories
#
#  id                :integer          not null, primary key
#  description       :text
#  icon              :string           default("FileQuestion")
#  is_income         :boolean          default(FALSE)
#  name              :string
#  created_at        :datetime         not null
#  updated_at        :datetime         not null
#  category_group_id :integer
#  user_id           :integer          not null
#
# Indexes
#
#  index_transaction_categories_on_category_group_id  (category_group_id)
#  index_transaction_categories_on_user_id            (user_id)
#
# Foreign Keys
#
#  category_group_id  (category_group_id => category_groups.id)
#  user_id            (user_id => users.id)
#
FactoryBot.define do
  factory :transaction_category do
    sequence(:name) { |n| "Category #{n}" }

    REAL_CATEGORIES = {
      "Food & Dining" => { icon: "Utensils", description: "Restaurants, groceries, delivery" },
      "Transportation" => { icon: "Car", description: "Gas, rideshare, public transit" },
      "Shopping" => { icon: "ShoppingBag", description: "Clothing, electronics, general purchases" },
      "Entertainment" => { icon: "Gamepad2", description: "Streaming, events, hobbies" },
      "Healthcare" => { icon: "Heart", description: "Doctor visits, pharmacy, insurance" },
      "Utilities" => { icon: "Zap", description: "Electricity, water, internet, phone" },
      "Salary" => { icon: "DollarSign", description: "Monthly salary and wages" },
      "Freelance" => { icon: "Briefcase", description: "Freelance and contract income" },
      "Education" => { icon: "BookOpen", description: "Courses, books, tuition" },
      "Travel" => { icon: "Plane", description: "Flights, hotels, travel expenses" },
    }.freeze

    trait :realistic do
      transient do
        category_key { REAL_CATEGORIES.keys.sample }
      end

      name { category_key }
      icon { REAL_CATEGORIES[category_key][:icon] }
      description { REAL_CATEGORIES[category_key][:description] }
    end
  end
end
