Rails.application.routes.draw do
  resource :session, only: [ :create, :destroy ]
  resources :passwords, param: :token

  get "up" => "rails/health#show", as: :rails_health_check

  # User
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
    end
  end

  resources :transactions, only: [ :index, :show, :create, :update, :destroy ]
  post "/transactions/:id/add_category/:category_id", to: "transactions#add_to_category"
  post "/transactions/:id/remove_category/:category_id", to: "transactions#remove_category"
  post "/transactions/:id/tags", to: "transactions#set_tags"
  resources :transaction_categories, only: [ :index, :create, :update, :destroy ]

  resources :tags, only: [ :index, :create, :update, :destroy ]

  resources :recurring_transactions do
    member do
      post :link_transaction
      delete "unlink_transaction/:transaction_id", action: :unlink_transaction
    end
  end

  resources :budget_lists, only: [ :index, :show, :create, :destroy ]

  post "/budget_lists/:id/item", to: "budget_items#create"
  delete "/budget_lists/:id/item/:item_id", to: "budget_items#destroy"

  get "/dashboard", to: "dashboard#show"

  get "/currencies", to: "currencies#index"
end
