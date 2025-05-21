// React Imports
import { toast } from 'react-toastify'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

// Types Import
import type { AxiosError, AxiosResponse } from 'axios'

import type { ErrorResponse } from '@/types/type'
import type {
  BackupType,
  CreateBackupType,
  BackupScheduleType,
  CreateBackupScheduleType,
  BackupVerificationType
} from '@/types/backupTypes'

// Utils Import
import axiosInstance from '@/utils/api/axiosInstance'
import { API_ROUTES } from '@/utils/constants/apiRoutes'

interface ListResponse<T> {
  results: T[]
}

export const useBackupHooks = () => {
  const queryClient = useQueryClient()

  // Backup List Hook
  const useBackups = () => {
    return useQuery<ListResponse<BackupType>>({
      queryKey: ['backups'],
      queryFn: () =>
        axiosInstance
          .get<ListResponse<BackupType>>(API_ROUTES.BACKUP.LIST)
          .then((response: AxiosResponse<ListResponse<BackupType>>) => response.data)
    })
  }

  // Create Backup Hook
  const useCreateBackup = () => {
    const mutation = useMutation<BackupType, AxiosError<ErrorResponse>, CreateBackupType>({
      mutationFn: (data: CreateBackupType) =>
        axiosInstance
          .post<BackupType>(API_ROUTES.BACKUP.CREATE, data)
          .then((response: AxiosResponse<BackupType>) => response.data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['backups'] })
        toast.success('Backup created successfully')
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

  // Restore Backup Hook
  const useRestoreBackup = () => {
    const mutation = useMutation<void, AxiosError<ErrorResponse>, number>({
      mutationFn: (backupId: number) =>
        axiosInstance
          .post<void>(API_ROUTES.BACKUP.RESTORE(backupId))
          .then((response: AxiosResponse<void>) => response.data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['backups'] })
        toast.success('Backup restored successfully')
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

  // Backup Schedule Hooks
  const useBackupSchedule = () => {
    return useQuery<BackupScheduleType>({
      queryKey: ['backupSchedule'],
      queryFn: () =>
        axiosInstance
          .get<BackupScheduleType>(API_ROUTES.BACKUP.SCHEDULE)
          .then((response: AxiosResponse<BackupScheduleType>) => response.data)
    })
  }

  const useCreateBackupSchedule = () => {
    const mutation = useMutation<BackupScheduleType, AxiosError<ErrorResponse>, CreateBackupScheduleType>({
      mutationFn: (data: CreateBackupScheduleType) =>
        axiosInstance
          .post<BackupScheduleType>(API_ROUTES.BACKUP.SCHEDULE, data)
          .then((response: AxiosResponse<BackupScheduleType>) => response.data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['backupSchedule'] })
        toast.success('Backup schedule created successfully')
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

  // Backup Verification Hook
  const useVerifyBackup = () => {
    const mutation = useMutation<BackupVerificationType, AxiosError<ErrorResponse>, number>({
      mutationFn: (backupId: number) =>
        axiosInstance
          .post<BackupVerificationType>(API_ROUTES.BACKUP.VERIFY(backupId))
          .then((response: AxiosResponse<BackupVerificationType>) => response.data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['backups'] })
        toast.success('Backup verification started')
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
    useBackups,
    useCreateBackup,
    useRestoreBackup,
    useBackupSchedule,
    useCreateBackupSchedule,
    useVerifyBackup
  }
}
