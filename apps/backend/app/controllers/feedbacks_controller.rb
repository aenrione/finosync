class FeedbacksController < ApplicationController
  def create
    feedback = current_user.feedbacks.build(feedback_params)

    if feedback.save
      render json: { id: feedback.id, content: feedback.content, created_at: feedback.created_at }, status: :created
    else
      render json: { error: feedback.errors.full_messages.join(", ") }, status: :unprocessable_entity
    end
  end

  private

  def feedback_params
    params.require(:feedback).permit(:content, :app_version, :device_info)
  end
end
