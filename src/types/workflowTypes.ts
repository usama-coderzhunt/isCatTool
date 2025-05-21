// Workflow Types
export interface WorkflowType {
  id: number
  name: string
  description?: string
  status: 'active' | 'inactive' | 'draft'
  steps: WorkflowStepType[]
  created_at: string
  updated_at: string
  created_by?: number
  updated_by?: number
}

export interface CreateWorkflowType {
  name: string
  description?: string
  status?: 'active' | 'inactive' | 'draft'
  steps: CreateWorkflowStepType[]
}

export interface UpdateWorkflowType extends Partial<CreateWorkflowType> {
  id: number
}

// Workflow Step Types
export interface WorkflowStepType {
  id: number
  workflow_id: number
  name: string
  description?: string
  order: number
  type: 'approval' | 'notification' | 'action'
  config: Record<string, any>
  conditions?: Record<string, any>
  created_at: string
  updated_at: string
}

export interface CreateWorkflowStepType {
  name: string
  description?: string
  order: number
  type: 'approval' | 'notification' | 'action'
  config: Record<string, any>
  conditions?: Record<string, any>
}

// Workflow Execution Types
export interface WorkflowExecutionType {
  id: number
  workflow_id: number
  status: 'pending' | 'in_progress' | 'completed' | 'failed'
  current_step?: number
  context: Record<string, any>
  results: Array<{
    step_id: number
    status: 'success' | 'failure'
    output?: any
    error?: string
    executed_at: string
  }>
  started_at: string
  completed_at?: string
}

export interface StartWorkflowExecutionType {
  workflow_id: number
  context: Record<string, any>
}
