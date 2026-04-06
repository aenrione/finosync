class BudaApiClient
  BASE_URL = "https://www.buda.com/api/v2"

  class Error < StandardError; end

  Balance = Data.define(:id, :available, :current, :frozen, :pending)
  Deposit = Data.define(:id, :amount, :currency, :created_at)
  Withdrawal = Data.define(:id, :amount, :currency, :created_at)
  Market = Data.define(:id, :name, :last_price)

  def initialize(api_key, api_secret)
    @api_key = api_key
    @api_secret = api_secret
  end

  def balances
    data = get("balances", authenticated: true)
    (data[:balances] || []).map do |b|
      Balance.new(
        id: b[:id],
        available: b[:available_amount]&.first,
        current: b[:amount]&.first,
        frozen: b[:frozen_amount]&.first,
        pending: b[:pending_withdraw_amount]&.first
      )
    end
  end

  def get_balance(currency)
    data = get("balances/#{currency}", authenticated: true)
    b = data[:balance]
    Balance.new(
      id: b[:id],
      available: b[:available_amount]&.first,
      current: b[:amount]&.first,
      frozen: b[:frozen_amount]&.first,
      pending: b[:pending_withdraw_amount]&.first
    )
  end

  def deposits(currency)
    data = get("currencies/#{currency}/deposits", authenticated: true)
    (data[:deposits] || []).map do |d|
      Deposit.new(
        id: d[:id],
        amount: d[:amount]&.first,
        currency: d[:currency],
        created_at: d[:created_at]
      )
    end
  end

  def withdrawals(currency)
    data = get("currencies/#{currency}/withdrawals", authenticated: true)
    (data[:withdrawals] || []).map do |w|
      Withdrawal.new(
        id: w[:id],
        amount: w[:amount]&.first,
        currency: w[:currency],
        created_at: w[:created_at]
      )
    end
  end

  def get_market(market_id)
    market_data = get("markets/#{market_id.upcase}")
    ticker_data = get("markets/#{market_id.upcase}/ticker")
    Market.new(
      id: market_data.dig(:market, :id),
      name: market_data.dig(:market, :name),
      last_price: ticker_data.dig(:ticker, :last_price)&.first
    )
  end

  private

  def get(resource, authenticated: false)
    uri = URI.parse("#{BASE_URL}/#{resource}")
    http = Net::HTTP.new(uri.host, uri.port)
    http.use_ssl = true

    if authenticated
      timestamp = (Time.now.to_f * 1_000_000).to_i.to_s
      signature = OpenSSL::HMAC.hexdigest("SHA384", @api_secret, "GET #{uri.path} #{timestamp}")

      headers = {
        "Content-Type" => "application/json",
        "X-SBTC-APIKEY" => @api_key,
        "X-SBTC-SIGNATURE" => signature,
        "X-SBTC-NONCE" => timestamp
      }
      request = Net::HTTP::Get.new(uri.path, headers)
    else
      request = Net::HTTP::Get.new(uri.path)
    end

    response = http.request(request)
    parsed = JSON.parse(response.body, symbolize_names: true)

    if response.code.to_i >= 400
      error_msg = parsed.dig(:error, :message) || parsed[:message] || "HTTP #{response.code}"
      raise Error, error_msg
    end

    parsed
  end
end
