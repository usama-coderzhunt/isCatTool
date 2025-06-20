// Comment Types
export interface CommentType {
  id: number
  content: string
  entity_type: 'page' | 'component' | 'media' | 'workflow'
  entity_id: number
  parent_id?: number
  status: 'pending' | 'approved' | 'rejected' | 'spam'
  reactions: Record<string, number>
  created_at: string
  updated_at: string
  created_by?: number
}

export interface CreateCommentType {
  content: string
  entity_type: 'page' | 'component' | 'media' | 'workflow'
  entity_id: number
  parent_id?: number
}

export interface UpdateCommentType extends Partial<CreateCommentType> {
  id: number
}

// Comment Moderation Types
export interface CommentModerationActionType {
  id: number
  action: 'approve' | 'reject' | 'mark_spam'
  reason?: string
}

// Comment Reaction Types
export interface CommentReactionType {
  id: number
  comment_id: number
  reaction: string
  created_at: string
  created_by?: number
}

export interface CreateCommentReactionType {
  comment_id: number
  reaction: string
}

// Comment Thread Types
export interface CommentThreadType {
  id: number
  comments: CommentType[]
  total_comments: number
  total_reactions: number
  last_activity: string
}

// Comment Statistics Types
export interface CommentStatisticsType {
  total_comments: number
  pending_comments: number
  approved_comments: number
  rejected_comments: number
  spam_comments: number
  by_entity: Record<string, number>
  by_status: Record<string, number>
  top_reactions: Array<{
    reaction: string
    count: number
  }>
  activity_over_time: Array<{
    date: string
    count: number
  }>
}
