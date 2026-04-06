class FintualApiClient
  BASE_URL = "https://fintual.cl/api"

  class Error < StandardError; end

  Goal = Data.define(:name, :created_at, :current, :deposited, :profit)

  def initialize(email, password)
    @email = email
    @token = fetch_token(email, password)
  end

  def goals
    data = get("goals")
    data.map do |goal|
      attrs = goal[:attributes]
      Goal.new(
        name: attrs[:name],
        created_at: attrs[:created_at],
        current: attrs[:nav],
        deposited: attrs[:deposited],
        profit: attrs[:profit]
      )
    end
  end

  private

  def fetch_token(email, password)
    body = { user: { email: email, password: password } }
    uri = URI.parse("#{BASE_URL}/access_tokens")
    response = make_request(:post, uri, body: body)
    response.dig(:data, :attributes, :token) || raise(Error, "No token returned")
  end

  def get(resource)
    uri = URI.parse("#{BASE_URL}/#{resource}")
    response = make_request(:get, uri)
    response[:data] || raise(Error, "No data in response")
  end

  def make_request(method, uri, body: nil)
    http = Net::HTTP.new(uri.host, uri.port)
    http.use_ssl = true

    request = case method
              when :get
                Net::HTTP::Get.new(uri.path, auth_headers)
              when :post
                req = Net::HTTP::Post.new(uri.path, { "Content-Type" => "application/json" })
                req.body = body.to_json
                req
              end

    response = http.request(request)
    parsed = JSON.parse(response.body, symbolize_names: true)

    if parsed[:status] == "error" || (response.code.to_i >= 400 && parsed[:error])
      raise Error, parsed[:message] || parsed[:error]
    end

    parsed
  end

  def auth_headers
    {
      "Content-Type" => "application/json",
      "X-User-Email" => @email,
      "X-User-Token" => @token
    }
  end
end
