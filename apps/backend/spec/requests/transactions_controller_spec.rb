RSpec.describe 'Transactions API', type: :request do
  let(:session) { create(:session) }
  let(:user) { session.user }
  let(:buda_account) { create(:buda_account, user: user) }
  let(:auth_headers) {
    {
      Authorization: "Bearer #{session.token}",
      Accept: "application/json"
    }
  }
  let(:account) { create(:account, user: user) }

  before do
    allow_any_instance_of(ValidateFintocAccount).to receive(:perform).and_return(true)
  end

  describe 'GET /transactions' do
    it 'returns a list of transactions' do
      create_list(:transaction, 3, account: account)

      get '/transactions', headers: auth_headers

      expect(response).to have_http_status(:ok)
      expect(response.parsed_body).to be_an(Array)
      expect(response.parsed_body.size).to eq(3)
    end
  end

  describe 'GET /transactions/:id' do
    it 'returns a single transaction' do
      transaction = create(:transaction, account: account)

      get "/transactions/#{transaction.id}", headers: auth_headers

      expect(response).to have_http_status(:ok)
      expect(response.parsed_body[:id]).to eq(transaction.id)
    end
  end

  describe 'POST /transactions/:id/add_category/:category_id' do
    it 'adds a category to the transaction' do
      transaction = create(:transaction, account: account)
      category = create(:transaction_category, user: user)

      post "/transactions/#{transaction.id}/add_category/#{category.id}", headers: auth_headers

      expect(response).to have_http_status(:ok)
    end
  end

  describe 'POST /transactions/:id/remove_category/:category_id' do
    it 'removes a category from the transaction' do
      category = create(:transaction_category, user: user)
      transaction = create(:transaction, account: account, transaction_category: category)

      post "/transactions/#{transaction.id}/remove_category/#{category.id}", headers: auth_headers

      expect(response).to have_http_status(:ok)
    end
  end
end
