import type {
  CreateCommentType,
  UpdateCommentType,
  CommentModerationActionType,
  CreateCommentReactionType
} from '@/types/commentTypes'

export const mapCreateCommentData = (data: CreateCommentType) => ({
  content: data.content,
  entity_type: data.entity_type,
  entity_id: data.entity_id,
  parent_id: data.parent_id
})

export const mapUpdateCommentData = (data: Partial<CreateCommentType>) => {
  const updateData: Partial<CreateCommentType> = {}

  if (data.content) updateData.content = data.content
  if (data.entity_type) updateData.entity_type = data.entity_type
  if (data.entity_id) updateData.entity_id = data.entity_id
  if (data.parent_id !== undefined) updateData.parent_id = data.parent_id

  return updateData
}

export const mapCommentModerationActionData = (data: CommentModerationActionType) => ({
  action: data.action,
  reason: data.reason
})

export const mapCreateCommentReactionData = (data: CreateCommentReactionType) => ({
  comment_id: data.comment_id,
  reaction: data.reaction
})
