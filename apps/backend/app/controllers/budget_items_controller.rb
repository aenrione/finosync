class BudgetItemsController < ApplicationController
  def create
    return head(:bad_request) if params[:title].blank? || params[:price_amount].blank?

    list = BudgetList.find_by(id: params[:id])
    return head(:bad_request) if list.blank?

    @item = BudgetItem.new(category_params)
    @item.budget_list = list
    if @item.save!
      render_jsonapi @item
    else
      head(:bad_request)
    end
  end

  def destroy
    list = BudgetList.find_by(id: params[:id])
    item = BudgetItem.find_by(id: params[:item_id])
    return head(:bad_request) if list.blank? || item.blank?

    render_jsonapi item if item.destroy
  end

  private

  def category_params
    params.permit(:title, :description, :price_amount)
  end
end
