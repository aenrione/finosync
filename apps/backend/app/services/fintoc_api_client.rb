require "net/http"
require "json"
require "uri"

class FintocApiClient
  BASE_URL = "https://api.fintoc.com/v1"

  class Error < StandardError; end

  def initialize(secret_key: ENV.fetch("FINTOC_SECRET_KEY"))
    @secret_key = secret_key
  end

  def create_link_intent(product:, holder_type:, country:)
    post("/link_intents", { product: product, holder_type: holder_type, country: country })
  end

  def exchange_token(exchange_token:)
    post("/link_intents/exchange", { exchange_token: exchange_token })
  end

  private

  def post(path, body)
    uri = URI("#{BASE_URL}#{path}")
    request = Net::HTTP::Post.new(uri)
    request["Authorization"] = @secret_key
    request["Content-Type"] = "application/json"
    request.body = body.to_json

    response = Net::HTTP.start(uri.hostname, uri.port, use_ssl: true) do |http|
      http.request(request)
    end

    parsed = JSON.parse(response.body)

    unless response.is_a?(Net::HTTPSuccess)
      message = parsed.dig("error", "message") || "Fintoc API error (#{response.code})"
      raise Error, message
    end

    parsed
  end
end
