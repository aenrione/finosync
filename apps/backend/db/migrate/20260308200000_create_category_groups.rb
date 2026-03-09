class CreateCategoryGroups < ActiveRecord::Migration[8.0]
  def change
    create_table :category_groups do |t|
      t.string :name, null: false
      t.integer :display_order, default: 0, null: false
      t.integer :group_type, default: 0, null: false
      t.references :user, null: false, foreign_key: true
      t.timestamps
    end
    add_index :category_groups, [ :user_id, :name ], unique: true
  end
end
