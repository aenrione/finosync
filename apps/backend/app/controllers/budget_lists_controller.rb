class BudgetListsController < ApplicationController
  def index
    @lists = current_user.budget_lists
    pagy, @lists = get_pagination(@lists)
    render_jsonapi @lists, meta: pagy_metadata(pagy)
  end

  def show
    list = BudgetList.find_by(id: params[:id])
    return head(:bad_request) if list.blank?

    render_jsonapi list
  end

  def destroy
    list = BudgetList.find_by(id: params[:id])
    return head(:bad_request) if list.blank?

    render_jsonapi list, status: :ok if list.destroy!
  end

  def create
    return head(:bad_request) if category_params[:title].blank?

    @list = BudgetList.new(category_params)
    @list.user = current_user
    if @list.save!
      render_jsonapi @list
    else
      head(:bad_request)
    end
  end

  private

  def category_params
    params.permit(:title, :description)
  end
end
