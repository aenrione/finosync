Rails.application.routes.draw do
  resource :session, only: [ :create, :destroy ]
  resources :passwords, param: :token

  get "up" => "rails/health#show", as: :rails_health_check

  # User
  post "/user", to: "users#create"
  patch "/user/preferences", to: "users#update_preferences"
  delete "/user", to: "users#destroy"
  get "/user", to: "users#show"
  get "/user/balances", to: "users#balances"
  get "/user/capabilities", to: "users#get_capabilities"
  get "/user/balance_to_chart", to: "users#balance_to_chart"
  get "/user/transactions_to_chart", to: "users#transactions_by_category_to_chart"
  post "/user/update_info", to: "users#update_everything"
  post "/user/set_quota", to: "users#set_quota"

  # Charts
  get "/charts/data", to: "charts#data"

  resources :accounts do
    member do
      get :charts
      post :sync
    end
  end

  resources :transactions, only: [ :index, :show, :create, :update, :destroy ]
  post "/transactions/:id/add_category/:category_id", to: "transactions#add_to_category"
  post "/transactions/:id/remove_category/:category_id", to: "transactions#remove_category"
  post "/transactions/:id/tags", to: "transactions#set_tags"
  resources :transaction_categories, only: [ :index, :create, :update, :destroy ]

  resources :tags, only: [ :index, :create, :update, :destroy ]

  resources :rules, only: [ :index, :show, :create, :update, :destroy ] do
    member do
      post :run
    end

    collection do
      post :run_all
      post :reorder
    end
  end

  resources :recurring_transactions do
    member do
      post :link_transaction
      delete "unlink_transaction/:transaction_id", action: :unlink_transaction
    end
  end

  resources :shopping_lists, only: [ :index, :show, :create, :update, :destroy ]

  post "/shopping_lists/:id/item", to: "shopping_items#create"
  patch "/shopping_lists/:id/item/:item_id", to: "shopping_items#update"
  delete "/shopping_lists/:id/item/:item_id", to: "shopping_items#destroy"

  get "/dashboard", to: "dashboard#show"

  # Monthly budget system
  get "/budget", to: "budget_periods#show"
  post "/budget/copy_previous", to: "budget_periods#copy_previous"
  post "/budget/:budget_period_id/allocations", to: "budget_allocations#upsert"
  delete "/budget/:budget_period_id/allocations/:id", to: "budget_allocations#destroy"

  resources :category_groups, only: [ :index, :create, :update, :destroy ]

  get "/currencies", to: "currencies#index"

  resources :feedbacks, only: [ :create ]

  # Fintoc bank connection (exchange token flow)
  post "/fintoc/link_intent", to: "fintoc_connections#create_link_intent"
  post "/fintoc/exchange", to: "fintoc_connections#exchange"

  # Fintual connection (2FA flow)
  post "/fintual/initiate_login", to: "fintual_connections#initiate_login"
  post "/fintual/finalize_login", to: "fintual_connections#finalize_login"

  # Webhooks (unauthenticated — called by external services)
  post "/webhooks/fintoc", to: "webhooks#fintoc"
end
