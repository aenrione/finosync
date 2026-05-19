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

  describe 'PUT /transactions/:id' do
    context 'when the transaction belongs to a local account' do
      it 'updates editable fields' do
        transaction = create(:transaction, account: account, description: 'old')

        put "/transactions/#{transaction.id}",
            headers: auth_headers,
            params: { description: 'new', amount: -1500 }

        expect(response).to have_http_status(:ok)
        expect(transaction.reload.description).to eq('new')
        expect(transaction.reload.amount).to eq(-1500)
      end

      it 'toggles the ignore flag to true' do
        transaction = create(:transaction, account: account, ignore: false)

        put "/transactions/#{transaction.id}",
            headers: auth_headers,
            params: { ignore: true }

        expect(response).to have_http_status(:ok)
        expect(transaction.reload.ignore).to be(true)
      end

      it 'toggles the ignore flag back to false' do
        transaction = create(:transaction, account: account, ignore: true)

        put "/transactions/#{transaction.id}",
            headers: auth_headers,
            params: { ignore: false }

        expect(response).to have_http_status(:ok)
        expect(transaction.reload.ignore).to be(false)
      end

      it 'ignores params that are not permitted' do
        transaction = create(:transaction, account: account, currency: 'CLP')

        put "/transactions/#{transaction.id}",
            headers: auth_headers,
            params: { currency: 'USD' }

        expect(response).to have_http_status(:ok)
        expect(transaction.reload.currency).to eq('CLP')
      end
    end

    context 'when the transaction belongs to a non-local account' do
      it 'returns 403 for a buda-account transaction' do
        buda = create(:account, :buda, user: user)
        transaction = create(:transaction, account: buda, ignore: false)

        put "/transactions/#{transaction.id}",
            headers: auth_headers,
            params: { ignore: true }

        expect(response).to have_http_status(:forbidden)
        expect(transaction.reload.ignore).to be(false)
      end

      it 'returns 403 for a fintoc-account transaction' do
        fintoc = create(:account, :fintoc, user: user)
        transaction = create(:transaction, account: fintoc, description: 'original')

        put "/transactions/#{transaction.id}",
            headers: auth_headers,
            params: { description: 'edited' }

        expect(response).to have_http_status(:forbidden)
        expect(transaction.reload.description).to eq('original')
      end
    end

    context 'when the transaction does not exist or belongs to another user' do
      it 'returns 404 for an unknown id' do
        put '/transactions/999999',
            headers: auth_headers,
            params: { ignore: true }

        expect(response).to have_http_status(:not_found)
      end

      it 'returns 404 for a transaction owned by another user' do
        other_user_account = create(:account, user: create(:user))
        transaction = create(:transaction, account: other_user_account)

        put "/transactions/#{transaction.id}",
            headers: auth_headers,
            params: { ignore: true }

        expect(response).to have_http_status(:not_found)
      end
    end
  end

  describe 'DELETE /transactions/:id' do
    context 'when the transaction belongs to a local account' do
      it 'deletes the transaction' do
        transaction = create(:transaction, account: account)

        delete "/transactions/#{transaction.id}", headers: auth_headers

        expect(response).to have_http_status(:ok)
        expect(Transaction.exists?(transaction.id)).to be(false)
      end
    end

    context 'when the transaction belongs to a non-local account' do
      it 'returns 403 and keeps the transaction' do
        buda = create(:account, :buda, user: user)
        transaction = create(:transaction, account: buda)

        delete "/transactions/#{transaction.id}", headers: auth_headers

        expect(response).to have_http_status(:forbidden)
        expect(Transaction.exists?(transaction.id)).to be(true)
      end
    end

    context 'when the transaction does not exist or belongs to another user' do
      it 'returns 404 for an unknown id' do
        delete '/transactions/999999', headers: auth_headers
        expect(response).to have_http_status(:not_found)
      end

      it 'returns 404 for a transaction owned by another user' do
        other_user_account = create(:account, user: create(:user))
        transaction = create(:transaction, account: other_user_account)

        delete "/transactions/#{transaction.id}", headers: auth_headers

        expect(response).to have_http_status(:not_found)
        expect(Transaction.exists?(transaction.id)).to be(true)
      end
    end
  end

  describe 'POST /transactions' do
    it 'applies matching rules after manual creation' do
      category = create(:transaction_category, user: user, name: 'Shopping')

      create(
        :rule,
        user: user,
        conditions: {
          logic: 'and',
          children: [
            {
              field: 'merchant',
              operator: 'contains',
              value: 'amazon'
            }
          ]
        },
        actions: [
          {
            type: 'assign_category',
            transaction_category_id: category.id
          }
        ]
      )

      post '/transactions',
           headers: auth_headers,
           params: {
             account_id: account.id,
             description: 'Amazon order',
             amount: -19990,
             transaction_date: '2026-03-09'
           }

      expect(response).to have_http_status(:created)
      expect(response.parsed_body['transaction_category_id']).to eq(category.id)
    end
  end
end
