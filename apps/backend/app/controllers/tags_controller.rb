class TagsController < ApplicationController
  before_action :set_tag, only: %i[update destroy]

  def index
    tags = current_user.tags.order(:name)
    tags = tags.where("name LIKE ?", "%#{params[:search]}%") if params[:search].present?
    render json: tags.map { |tag| serialize_tag(tag) }
  end

  def create
    tag = current_user.tags.build(tag_params)

    if tag.save
      render json: serialize_tag(tag), status: :created
    else
      render json: { error: tag.errors.full_messages.join(", ") }, status: :unprocessable_entity
    end
  end

  def update
    if @tag.update(tag_params)
      render json: serialize_tag(@tag)
    else
      render json: { error: @tag.errors.full_messages.join(", ") }, status: :unprocessable_entity
    end
  end

  def destroy
    @tag.destroy
    head :no_content
  end

  private

  def set_tag
    @tag = current_user.tags.find(params[:id])
  end

  def tag_params
    params.require(:tag).permit(:name, :color)
  end

  def serialize_tag(tag)
    {
      id: tag.id,
      name: tag.name,
      color: tag.color,
      transaction_count: tag.transactions.count
    }
  end
end
