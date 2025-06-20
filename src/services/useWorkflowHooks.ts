// React Imports
import { toast } from 'react-toastify'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

// Types Import
import type { AxiosError, AxiosResponse } from 'axios'

import type { ErrorResponse } from '@/types/type'
import type {
  WorkflowType,
  CreateWorkflowType,
  UpdateWorkflowType,
  WorkflowStepType,
  CreateWorkflowStepType,
  WorkflowExecutionType,
  StartWorkflowExecutionType
} from '@/types/workflowTypes'

// Utils Import
import axiosInstance from '@/utils/api/axiosInstance'
import {
  mapCreateWorkflowData,
  mapUpdateWorkflowData,
  mapCreateWorkflowStepData,
  mapStartWorkflowExecutionData
} from './utility/workflow'

interface ListResponse<T> {
  results: T[]
}

export const useWorkflowHooks = () => {
  const queryClient = useQueryClient()

  // Workflow Hooks
  const useWorkflows = () => {
    return useQuery<ListResponse<WorkflowType>>({
      queryKey: ['workflows'],
      queryFn: () =>
        axiosInstance
          .get<ListResponse<WorkflowType>>('/api/workflows/')
          .then((response: AxiosResponse<ListResponse<WorkflowType>>) => response.data)
    })
  }

  const useWorkflow = (id: number) => {
    return useQuery<WorkflowType>({
      queryKey: ['workflows', id],
      queryFn: () =>
        axiosInstance
          .get<WorkflowType>(`/api/workflows/${id}/`)
          .then((response: AxiosResponse<WorkflowType>) => response.data),
      enabled: !!id
    })
  }

  const useCreateWorkflow = () => {
    const mutation = useMutation<WorkflowType, AxiosError<ErrorResponse>, CreateWorkflowType>({
      mutationFn: (data: CreateWorkflowType) => {
        const workflowData = mapCreateWorkflowData(data)

        return axiosInstance
          .post<WorkflowType>('/api/workflows/', workflowData)
          .then((response: AxiosResponse<WorkflowType>) => response.data)
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['workflows'] })
        toast.success('Workflow created successfully')
      },
      onError: (error: AxiosError<ErrorResponse>) => {
        const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred.'

        toast.error(errorMessage)
      }
    })

    return {
      data: mutation.data,
      error: mutation.error,
      isLoading: mutation.isPending,
      isSuccess: mutation.isSuccess,
      mutate: mutation.mutate
    }
  }

  const useUpdateWorkflow = () => {
    const mutation = useMutation<WorkflowType, AxiosError<ErrorResponse>, UpdateWorkflowType>({
      mutationFn: (data: UpdateWorkflowType) => {
        const { id, ...updateData } = data
        const workflowData = mapUpdateWorkflowData(updateData as UpdateWorkflowType)

        return axiosInstance
          .patch<WorkflowType>(`/api/workflows/${id}/`, workflowData)
          .then((response: AxiosResponse<WorkflowType>) => response.data)
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['workflows'] })
        toast.success('Workflow updated successfully')
      },
      onError: (error: AxiosError<ErrorResponse>) => {
        const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred.'

        toast.error(errorMessage)
      }
    })

    return {
      data: mutation.data,
      error: mutation.error,
      isLoading: mutation.isPending,
      isSuccess: mutation.isSuccess,
      mutate: mutation.mutate
    }
  }

  const useDeleteWorkflow = () => {
    const mutation = useMutation<void, AxiosError<ErrorResponse>, number>({
      mutationFn: (id: number) => {
        return axiosInstance.delete(`/api/workflows/${id}/`).then((response: AxiosResponse<void>) => response.data)
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['workflows'] })
        toast.success('Workflow deleted successfully')
      },
      onError: (error: AxiosError<ErrorResponse>) => {
        const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred.'

        toast.error(errorMessage)
      }
    })

    return {
      data: mutation.data,
      error: mutation.error,
      isLoading: mutation.isPending,
      isSuccess: mutation.isSuccess,
      mutate: mutation.mutate
    }
  }

  // Workflow Step Hooks
  const useAddWorkflowStep = () => {
    const mutation = useMutation<
      WorkflowType,
      AxiosError<ErrorResponse>,
      { workflow_id: number; step: CreateWorkflowStepType }
    >({
      mutationFn: (data: { workflow_id: number; step: CreateWorkflowStepType }) => {
        const stepData = mapCreateWorkflowStepData(data.step)

        return axiosInstance
          .post<WorkflowType>(`/api/workflows/${data.workflow_id}/steps/`, stepData)
          .then((response: AxiosResponse<WorkflowType>) => response.data)
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['workflows'] })
        toast.success('Workflow step added successfully')
      },
      onError: (error: AxiosError<ErrorResponse>) => {
        const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred.'

        toast.error(errorMessage)
      }
    })

    return {
      data: mutation.data,
      error: mutation.error,
      isLoading: mutation.isPending,
      isSuccess: mutation.isSuccess,
      mutate: mutation.mutate
    }
  }

  // Workflow Execution Hooks
  const useWorkflowExecutions = (workflowId: number) => {
    return useQuery<ListResponse<WorkflowExecutionType>>({
      queryKey: ['workflowExecutions', workflowId],
      queryFn: () =>
        axiosInstance
          .get<ListResponse<WorkflowExecutionType>>(`/api/workflows/${workflowId}/executions/`)
          .then((response: AxiosResponse<ListResponse<WorkflowExecutionType>>) => response.data),
      enabled: !!workflowId
    })
  }

  const useStartWorkflowExecution = () => {
    const mutation = useMutation<WorkflowExecutionType, AxiosError<ErrorResponse>, StartWorkflowExecutionType>({
      mutationFn: (data: StartWorkflowExecutionType) => {
        const executionData = mapStartWorkflowExecutionData(data)

        return axiosInstance
          .post<WorkflowExecutionType>(`/api/workflows/${data.workflow_id}/execute/`, executionData)
          .then((response: AxiosResponse<WorkflowExecutionType>) => response.data)
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['workflowExecutions'] })
        toast.success('Workflow execution started successfully')
      },
      onError: (error: AxiosError<ErrorResponse>) => {
        const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred.'

        toast.error(errorMessage)
      }
    })

    return {
      data: mutation.data,
      error: mutation.error,
      isLoading: mutation.isPending,
      isSuccess: mutation.isSuccess,
      mutate: mutation.mutate
    }
  }

  return {
    // Workflow hooks
    useWorkflows,
    useWorkflow,
    useCreateWorkflow,
    useUpdateWorkflow,
    useDeleteWorkflow,

    // Workflow Step hooks
    useAddWorkflowStep,

    // Workflow Execution hooks
    useWorkflowExecutions,
    useStartWorkflowExecution
  }
}
