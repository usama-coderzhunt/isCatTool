import type {
  CreateWorkflowType,
  UpdateWorkflowType,
  CreateWorkflowStepType,
  StartWorkflowExecutionType
} from '@/types/workflowTypes'

export const mapCreateWorkflowData = (data: CreateWorkflowType) => ({
  name: data.name,
  description: data.description,
  status: data.status ?? 'draft',
  steps: data.steps.map(mapCreateWorkflowStepData)
})

export const mapUpdateWorkflowData = (data: UpdateWorkflowType) => {
  const updateData: Partial<CreateWorkflowType> = {}

  if (data.name) updateData.name = data.name
  if (data.description !== undefined) updateData.description = data.description
  if (data.status) updateData.status = data.status
  if (data.steps) updateData.steps = data.steps.map(mapCreateWorkflowStepData)

  return updateData
}

export const mapCreateWorkflowStepData = (data: CreateWorkflowStepType) => ({
  name: data.name,
  description: data.description,
  order: data.order,
  type: data.type,
  config: data.config,
  conditions: data.conditions
})

export const mapStartWorkflowExecutionData = (data: StartWorkflowExecutionType) => ({
  context: data.context
})
