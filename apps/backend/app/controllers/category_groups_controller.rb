class CategoryGroupsController < ApplicationController
  def index
    groups = current_user.category_groups.includes(:transaction_categories)
    data = groups.map do |group|
      CategoryGroupSerializer.new(group).serializable_hash.dig(:data, :attributes)
    end
    render json: data, status: :ok
  end

  def create
    group = current_user.category_groups.new(group_params)
    if group.save
      render_jsonapi group, serializer: CategoryGroupSerializer, status: :created
    else
      render json: { errors: group.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update
    group = current_user.category_groups.find(params[:id])
    if group.update(group_params)
      render_jsonapi group, serializer: CategoryGroupSerializer
    else
      render json: { errors: group.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    group = current_user.category_groups.find(params[:id])
    group.destroy!
    head :no_content
  end

  private

  def group_params
    params.permit(:name, :display_order, :group_type)
  end
end
