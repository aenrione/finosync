class CreateRules < ActiveRecord::Migration[8.0]
  def change
    create_table :rules do |t|
      t.references :user, null: false, foreign_key: true
      t.string :name, null: false
      t.text :description
      t.boolean :enabled, null: false, default: true
      t.integer :priority, null: false, default: 0
      t.json :conditions, null: false, default: {}
      t.json :actions, null: false, default: []
      t.string :overwrite_mode, null: false, default: "fill_blanks"
      t.datetime :last_run_at
      t.string :last_run_status
      t.integer :last_run_matched_count, null: false, default: 0
      t.integer :last_run_updated_count, null: false, default: 0
      t.text :last_error

      t.timestamps
    end

    add_index :rules, [ :user_id, :priority ]
  end
end
