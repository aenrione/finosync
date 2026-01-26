class TransactionCategoriesController < ApplicationController
  def index
    @categories = current_user.transaction_categories
    
    # Add search functionality
    if params[:search].present?
      search_term = "%#{params[:search].downcase}%"
      @categories = @categories.where("LOWER(name) LIKE ? OR LOWER(description) LIKE ?", search_term, search_term)
    end
    
    pagy, @categories = get_pagination(@categories)
    render_jsonapi @categories, meta: pagy_metadata(pagy)
  end

  def create
    @category = TransactionCategory.new(category_params)
    @category.user = current_user
    if @category.save
      render_jsonapi @category, status: :ok
    else
      render json: { error: @category.errors.full_messages.join(", ") }, status: :bad_request
    end
  end

  def update
    @category = current_user.transaction_categories.find_by(id: params[:id])
    return head(:not_found) unless @category
    
    if @category.update(category_params)
      render_jsonapi @category, status: :ok
    else
      render json: { error: @category.errors.full_messages.join(", ") }, status: :bad_request
    end
  end

  def delete
    @category = current_user.transaction_categories.find_by(id: params[:id])
    return head(:not_found) unless @category
    
    if @category.destroy
      render_jsonapi @category, status: :ok
    else
      render json: { error: "Failed to delete category" }, status: :bad_request
    end
  end

  private

  def category_params
    params.permit(:name, :description, :icon)
  end
end
