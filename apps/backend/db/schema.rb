# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.0].define(version: 2026_04_07_120032) do
  create_table "account_assets", force: :cascade do |t|
    t.string "name", null: false
    t.date "creation_date"
    t.decimal "current", precision: 14, scale: 2
    t.decimal "profit", precision: 14, scale: 2
    t.decimal "pending", precision: 14, scale: 2
    t.decimal "frozen_asset", precision: 14, scale: 2
    t.decimal "deposited", precision: 14, scale: 2
    t.string "currency", default: "CLP", null: false
    t.integer "account_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["account_id"], name: "index_account_assets_on_account_id"
  end

  create_table "accounts", force: :cascade do |t|
    t.string "secret"
    t.string "primary_key", null: false
    t.string "currency", default: "CLP", null: false
    t.string "account_name", default: "Local", null: false
    t.decimal "balance", precision: 14, scale: 2, default: "0.0", null: false
    t.integer "user_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.decimal "income", precision: 14, scale: 2, default: "0.0"
    t.decimal "expense", precision: 14, scale: 2, default: "0.0"
    t.decimal "investments_return", precision: 14, scale: 2, default: "0.0"
    t.integer "account_type", default: 0, null: false
    t.string "session_token"
    t.datetime "session_expires_at"
    t.index ["user_id"], name: "index_accounts_on_user_id"
  end

  create_table "active_storage_attachments", force: :cascade do |t|
    t.string "name", null: false
    t.string "record_type", null: false
    t.integer "record_id", null: false
    t.integer "blob_id", null: false
    t.datetime "created_at", precision: nil, null: false
    t.index ["blob_id"], name: "index_active_storage_attachments_on_blob_id"
    t.index ["record_type", "record_id", "name", "blob_id"], name: "index_active_storage_attachments_uniqueness", unique: true
  end

  create_table "active_storage_blobs", force: :cascade do |t|
    t.string "key", null: false
    t.string "filename", null: false
    t.string "content_type"
    t.text "metadata"
    t.bigint "byte_size", null: false
    t.string "checksum", null: false
    t.datetime "created_at", precision: nil, null: false
    t.index ["key"], name: "index_active_storage_blobs_on_key", unique: true
  end

  create_table "budget_allocations", force: :cascade do |t|
    t.integer "budget_period_id", null: false
    t.integer "transaction_category_id", null: false
    t.decimal "planned_amount", precision: 14, scale: 2, default: "0.0", null: false
    t.decimal "rollover_in", precision: 14, scale: 2, default: "0.0"
    t.string "notes"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["budget_period_id", "transaction_category_id"], name: "idx_allocations_period_category", unique: true
    t.index ["budget_period_id"], name: "index_budget_allocations_on_budget_period_id"
    t.index ["transaction_category_id"], name: "index_budget_allocations_on_transaction_category_id"
  end

  create_table "budget_periods", force: :cascade do |t|
    t.integer "user_id", null: false
    t.integer "year", null: false
    t.integer "month", null: false
    t.integer "status", default: 0, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["user_id", "year", "month"], name: "index_budget_periods_on_user_id_and_year_and_month", unique: true
    t.index ["user_id"], name: "index_budget_periods_on_user_id"
  end

  create_table "category_groups", force: :cascade do |t|
    t.string "name", null: false
    t.integer "display_order", default: 0, null: false
    t.integer "group_type", default: 0, null: false
    t.integer "user_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["user_id", "name"], name: "index_category_groups_on_user_id_and_name", unique: true
    t.index ["user_id"], name: "index_category_groups_on_user_id"
  end

  create_table "feedbacks", force: :cascade do |t|
    t.integer "user_id", null: false
    t.text "content"
    t.string "app_version"
    t.string "device_info"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["user_id"], name: "index_feedbacks_on_user_id"
  end

  create_table "recurring_transaction_links", force: :cascade do |t|
    t.integer "recurring_transaction_id", null: false
    t.integer "transaction_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["recurring_transaction_id", "transaction_id"], name: "idx_recurring_tx_links_unique", unique: true
    t.index ["recurring_transaction_id"], name: "index_recurring_transaction_links_on_recurring_transaction_id"
    t.index ["transaction_id"], name: "index_recurring_transaction_links_on_transaction_id"
  end

  create_table "recurring_transactions", force: :cascade do |t|
    t.string "name", null: false
    t.decimal "amount", precision: 14, scale: 2, null: false
    t.string "currency", default: "CLP", null: false
    t.integer "frequency", default: 0, null: false
    t.date "start_date", null: false
    t.date "end_date"
    t.date "next_due_date", null: false
    t.boolean "is_active", default: true, null: false
    t.integer "transaction_type", default: 0, null: false
    t.boolean "auto_create", default: false, null: false
    t.string "notes"
    t.integer "user_id", null: false
    t.integer "transaction_category_id"
    t.integer "account_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["account_id"], name: "index_recurring_transactions_on_account_id"
    t.index ["transaction_category_id"], name: "index_recurring_transactions_on_transaction_category_id"
    t.index ["user_id"], name: "index_recurring_transactions_on_user_id"
  end

  create_table "rules", force: :cascade do |t|
    t.integer "user_id", null: false
    t.string "name", null: false
    t.text "description"
    t.boolean "enabled", default: true, null: false
    t.integer "priority", default: 0, null: false
    t.json "conditions", default: {}, null: false
    t.json "actions", default: [], null: false
    t.string "overwrite_mode", default: "fill_blanks", null: false
    t.datetime "last_run_at"
    t.string "last_run_status"
    t.integer "last_run_matched_count", default: 0, null: false
    t.integer "last_run_updated_count", default: 0, null: false
    t.text "last_error"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["user_id", "priority"], name: "index_rules_on_user_id_and_priority"
    t.index ["user_id"], name: "index_rules_on_user_id"
  end

  create_table "sessions", force: :cascade do |t|
    t.integer "user_id", null: false
    t.string "ip_address"
    t.string "user_agent"
    t.string "token", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["user_id"], name: "index_sessions_on_user_id"
  end

  create_table "shopping_items", force: :cascade do |t|
    t.string "title"
    t.string "description"
    t.decimal "price", precision: 14, scale: 2
    t.date "purchase_date"
    t.boolean "purchased", default: false
    t.string "source_href"
    t.integer "shopping_list_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "transaction_id"
    t.index ["shopping_list_id"], name: "index_shopping_items_on_shopping_list_id"
    t.index ["transaction_id"], name: "index_shopping_items_on_transaction_id"
  end

  create_table "shopping_lists", force: :cascade do |t|
    t.string "title"
    t.string "description"
    t.decimal "total_budget", precision: 14, scale: 2, default: "0.0", null: false
    t.date "start_date"
    t.date "end_date"
    t.integer "user_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "budget_allocation_id"
    t.index ["budget_allocation_id"], name: "index_shopping_lists_on_budget_allocation_id"
    t.index ["user_id"], name: "index_shopping_lists_on_user_id"
  end

  create_table "tags", force: :cascade do |t|
    t.string "name", null: false
    t.string "color"
    t.integer "user_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["user_id", "name"], name: "index_tags_on_user_id_and_name", unique: true
    t.index ["user_id"], name: "index_tags_on_user_id"
  end

  create_table "transaction_categories", force: :cascade do |t|
    t.string "name"
    t.text "description"
    t.integer "user_id", null: false
    t.string "icon", default: "FileQuestion"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "category_group_id"
    t.boolean "is_income", default: false
    t.index ["category_group_id"], name: "index_transaction_categories_on_category_group_id"
    t.index ["user_id"], name: "index_transaction_categories_on_user_id"
  end

  create_table "transaction_tags", force: :cascade do |t|
    t.integer "transaction_id", null: false
    t.integer "tag_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["tag_id"], name: "index_transaction_tags_on_tag_id"
    t.index ["transaction_id", "tag_id"], name: "index_transaction_tags_on_transaction_id_and_tag_id", unique: true
    t.index ["transaction_id"], name: "index_transaction_tags_on_transaction_id"
  end

  create_table "transactions", force: :cascade do |t|
    t.decimal "amount", precision: 14, scale: 2
    t.text "comment"
    t.string "currency"
    t.string "description"
    t.string "transaction_id"
    t.date "post_date"
    t.date "transaction_date"
    t.string "transaction_type"
    t.string "holder_id"
    t.string "holder_name"
    t.string "holder_institution"
    t.boolean "ignore", default: false
    t.integer "account_id"
    t.integer "transaction_category_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["account_id"], name: "index_transactions_on_account_id"
    t.index ["transaction_category_id"], name: "index_transactions_on_transaction_category_id"
  end

  create_table "users", force: :cascade do |t|
    t.string "email_address", null: false
    t.string "name", null: false
    t.string "password_digest", null: false
    t.decimal "balance", precision: 14, scale: 2, default: "0.0"
    t.decimal "income", precision: 14, scale: 2, default: "0.0"
    t.decimal "expense", precision: 14, scale: 2, default: "0.0"
    t.decimal "investments_return", precision: 14, scale: 2, default: "0.0"
    t.decimal "quota", precision: 14, scale: 2, default: "0.0"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "preferred_currency"
    t.decimal "monthly_income", precision: 14, scale: 2, default: "0.0"
    t.text "financial_goals"
    t.boolean "onboarding_completed", default: false
    t.index ["email_address"], name: "index_users_on_email_address", unique: true
  end

  create_table "versions", force: :cascade do |t|
    t.string "item_type"
    t.string "{:null=>false}"
    t.bigint "item_id", null: false
    t.string "event", null: false
    t.string "whodunnit"
    t.text "object", limit: 1073741823
    t.datetime "created_at", precision: nil
    t.index ["item_type", "item_id"], name: "index_versions_on_item_type_and_item_id"
  end

  add_foreign_key "account_assets", "accounts"
  add_foreign_key "accounts", "users"
  add_foreign_key "active_storage_attachments", "active_storage_blobs", column: "blob_id"
  add_foreign_key "budget_allocations", "budget_periods"
  add_foreign_key "budget_allocations", "transaction_categories"
  add_foreign_key "budget_periods", "users"
  add_foreign_key "category_groups", "users"
  add_foreign_key "feedbacks", "users"
  add_foreign_key "recurring_transaction_links", "recurring_transactions"
  add_foreign_key "recurring_transaction_links", "transactions"
  add_foreign_key "recurring_transactions", "accounts"
  add_foreign_key "recurring_transactions", "transaction_categories"
  add_foreign_key "recurring_transactions", "users"
  add_foreign_key "rules", "users"
  add_foreign_key "sessions", "users"
  add_foreign_key "shopping_items", "shopping_lists"
  add_foreign_key "shopping_items", "transactions"
  add_foreign_key "shopping_lists", "budget_allocations"
  add_foreign_key "shopping_lists", "users"
  add_foreign_key "tags", "users"
  add_foreign_key "transaction_categories", "category_groups"
  add_foreign_key "transaction_categories", "users"
  add_foreign_key "transaction_tags", "tags"
  add_foreign_key "transaction_tags", "transactions"
  add_foreign_key "transactions", "accounts"
  add_foreign_key "transactions", "transaction_categories"
end
