class CreateFeedbacks < ActiveRecord::Migration[8.0]
  def change
    create_table :feedbacks do |t|
      t.references :user, null: false, foreign_key: true
      t.text :content
      t.string :app_version
      t.string :device_info

      t.timestamps
    end
  end
end
