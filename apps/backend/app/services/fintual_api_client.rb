class FintualApiClient
  BASE_URL = "https://fintual.cl"

  class Error < StandardError; end

  Goal = Data.define(
    :id, :name, :created_at, :current, :deposited, :profit,
    :goal_type, :translated_goal_type, :not_net_deposited, :withdrawn
  )

  # --- Class methods for the 2FA login flow ---

  def self.initiate_login(email, password)
    uri = URI.parse("#{BASE_URL}/auth/sessions/initiate_login")
    body = { email: email, password: password }
    response = post_json(uri, body)

    unless response.code.to_i.between?(200, 201)
      parsed = JSON.parse(response.body, symbolize_names: true) rescue {}
      raise Error, parsed[:error] || parsed[:message] || "Login initiation failed (#{response.code})"
    end

    true
  end

  def self.finalize_login(email, password, code)
    uri = URI.parse("#{BASE_URL}/auth/sessions/finalize_login_web")
    body = { email: email, password: password, code: code }
    response = post_json(uri, body)

    unless response.code.to_i.between?(200, 201)
      parsed = JSON.parse(response.body, symbolize_names: true) rescue {}
      raise Error, parsed[:error] || parsed[:message] || "Code verification failed (#{response.code})"
    end

    set_cookie = response.get_fields("set-cookie")
    raise Error, "No session cookie returned" unless set_cookie&.any?

    cookie = set_cookie.map { |c| c.split(";").first }.join("; ")
    expires_match = set_cookie.join("; ").match(/expires=([^;]+)/i)
    expires_at = if expires_match
                   Time.parse(expires_match[1])
                 else
                   30.days.from_now
                 end

    { cookie: cookie, expires_at: expires_at }
  end

  # --- Instance: uses stored cookie for API calls ---

  def initialize(cookie)
    @cookie = cookie
  end

  def goals
    data = get("api/goals")
    data.map do |goal|
      attrs = goal[:attributes]
      Goal.new(
        id: goal[:id],
        name: attrs[:name],
        created_at: attrs[:created_at],
        current: attrs[:nav],
        deposited: attrs[:deposited],
        profit: attrs[:profit],
        goal_type: attrs[:goal_type],
        translated_goal_type: attrs[:translated_goal_type],
        not_net_deposited: attrs[:not_net_deposited] || 0,
        withdrawn: attrs[:withdrawn] || 0
      )
    end
  end

  private

  def get(path)
    uri = URI.parse("#{BASE_URL}/#{path}")
    http = Net::HTTP.new(uri.host, uri.port)
    http.use_ssl = true

    request = Net::HTTP::Get.new(uri.path, {
      "Cookie" => @cookie,
      "Accept" => "application/json"
    })

    response = http.request(request)
    parsed = JSON.parse(response.body, symbolize_names: true)

    if response.code.to_i == 401
      raise Error, "Session expired — please re-authenticate your Fintual account"
    end

    unless response.code.to_i.between?(200, 299)
      raise Error, parsed[:error] || parsed[:message] || "Request failed (#{response.code})"
    end

    parsed[:data] || raise(Error, "No data in response")
  end

  def self.post_json(uri, body)
    http = Net::HTTP.new(uri.host, uri.port)
    http.use_ssl = true
    req = Net::HTTP::Post.new(uri.path, { "Content-Type" => "application/json" })
    req.body = body.to_json
    http.request(req)
  end
end
