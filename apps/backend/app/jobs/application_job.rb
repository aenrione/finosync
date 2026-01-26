class ApplicationJob
  include Sidekiq::Worker
  sidekiq_options queue: 'default'
  MAX_SECONDS = 600 # 10 Minutes

  sidekiq_retry_in do |count, _exception|
    [(count**4) + 15 + (rand(30) * (count + 1)), MAX_SECONDS].min
  end
end
