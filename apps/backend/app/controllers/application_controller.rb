class ApplicationController < ActionController::API
  include ApplicationHelper
  include Authentication
  include Pagy::Backend

  respond_to :json

  private

  def get_pagination(resource)
    pagy, paginated_resource = pagy(
      resource.order(created_at: params[:order] || :desc),
                                    items: params[:limit] || 10,
                                    page: params[:page] || 1
    )
    return pagy, paginated_resource
  end

  def render_jsonapi(resource, options = {})
    return render json: {}, status: :ok if resource.nil?

    status = options.delete(:status) || :ok
    serializer = options.delete(:serializer) || default_serializer_for(resource)

    if is_collection?(resource)
      serialized = serializer.new(resource, options).serializable_hash
      data = serialized[:data].map { |item| item[:attributes] }
      meta = serialized[:meta]

      render json: data, meta: meta, status: status
    else
      serialized = serializer.new(resource, options).serializable_hash
      attributes = serialized.dig(:data, :attributes)
      render json: attributes || serialized, status: status
    end
  end

  def is_collection?(resource)
    resource.is_a?(Enumerable) && !resource.is_a?(Hash)
  end

  def default_serializer_for(resource)
    klass = if is_collection?(resource)
              resource.respond_to?(:klass) ? resource.klass : resource.first&.class
    else
              resource.class
    end
    raise ArgumentError, "No serializer class found for #{klass}" unless klass

    "#{klass}Serializer".constantize
  end
end
