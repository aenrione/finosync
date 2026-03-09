# == Schema Information
#
# Table name: rules
#
#  id                     :integer          not null, primary key
#  actions                :json             not null
#  conditions             :json             not null
#  description            :text
#  enabled                :boolean          default(TRUE), not null
#  last_error             :text
#  last_run_at            :datetime
#  last_run_matched_count :integer          default(0), not null
#  last_run_status        :string
#  last_run_updated_count :integer          default(0), not null
#  name                   :string           not null
#  overwrite_mode         :string           default("fill_blanks"), not null
#  priority               :integer          default(0), not null
#  created_at             :datetime         not null
#  updated_at             :datetime         not null
#  user_id                :integer          not null
#
# Indexes
#
#  index_rules_on_user_id               (user_id)
#  index_rules_on_user_id_and_priority  (user_id,priority)
#
# Foreign Keys
#
#  user_id  (user_id => users.id)
#
class RuleSerializer
  include JSONAPI::Serializer

  attributes :id, :name, :description, :enabled, :priority, :conditions, :actions,
             :overwrite_mode, :last_run_at, :last_run_status, :last_run_matched_count,
             :last_run_updated_count, :last_error, :created_at, :updated_at
end
