class ShoppingItemsController < ApplicationController
  def create
    return head(:bad_request) if params[:title].blank? || price_param.blank?

    list = current_user.shopping_lists.find_by(id: params[:id])
    return head(:bad_request) if list.blank?

    @item = ShoppingItem.new(item_params)
    @item.shopping_list = list
    if @item.save
      render_jsonapi @item, status: :created
    else
      render json: { error: @item.errors.full_messages.join(", ") }, status: :bad_request
    end
  end

  def update
    list = current_user.shopping_lists.find_by(id: params[:id])
    item = list&.items&.find_by(id: params[:item_id])
    return head(:bad_request) if list.blank? || item.blank?

    if item.update(item_params)
      render_jsonapi item, status: :ok
    else
      render json: { error: item.errors.full_messages.join(", ") }, status: :bad_request
    end
  end

  def destroy
    list = current_user.shopping_lists.find_by(id: params[:id])
    item = list&.items&.find_by(id: params[:item_id])
    return head(:bad_request) if list.blank? || item.blank?

    render_jsonapi item if item.destroy
  end

  private

  def price_param
    params[:price].presence || params[:price_amount].presence
  end

  def item_params
    attrs = params.permit(
      :title,
      :description,
      :purchase_date,
      :purchased,
      :source_href,
      :transaction_id,
    )
    attrs[:price] = price_param if price_param.present?
    attrs[:transaction_id] = nil if params.key?(:transaction_id) && params[:transaction_id].blank?
    attrs
  end
end
