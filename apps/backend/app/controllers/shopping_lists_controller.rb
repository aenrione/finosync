class ShoppingListsController < ApplicationController
  def index
    @lists = current_user.shopping_lists
    pagy, @lists = get_pagination(@lists)
    render_jsonapi @lists, meta: pagy_metadata(pagy)
  end

  def show
    list = current_user.shopping_lists.find_by(id: params[:id])
    return head(:bad_request) if list.blank?

    render_jsonapi list
  end

  def destroy
    list = current_user.shopping_lists.find_by(id: params[:id])
    return head(:bad_request) if list.blank?

    render_jsonapi list, status: :ok if list.destroy!
  end

  def update
    list = current_user.shopping_lists.find_by(id: params[:id])
    return head(:bad_request) if list.blank?

    if list.update(list_params)
      render_jsonapi list, status: :ok
    else
      render json: { error: list.errors.full_messages.join(", ") }, status: :bad_request
    end
  end

  def create
    return head(:bad_request) if list_params[:title].blank?

    @list = ShoppingList.new(list_params)
    @list.user = current_user
    if @list.save
      render_jsonapi @list, status: :created
    else
      render json: { error: @list.errors.full_messages.join(", ") }, status: :bad_request
    end
  end

  private

  def list_params
    attrs = params.permit(
      :title,
      :description,
      :total_budget,
      :start_date,
      :end_date,
      :budget_allocation_id,
    )
    attrs[:budget_allocation_id] = nil if params.key?(:budget_allocation_id) && params[:budget_allocation_id].blank?
    attrs
  end
end
