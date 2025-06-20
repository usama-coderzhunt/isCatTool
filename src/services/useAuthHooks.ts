// Next Imports
import { useRouter } from 'next/navigation'

// React Imports
import { toast } from 'react-toastify'
import { useMutation, useQuery } from '@tanstack/react-query'

// Axios Import
import type { AxiosError } from 'axios'

// Store Import
import { useAuthStore } from '@/store/useAuthStore'

// Types Import
import type { LoginInput, RegisterType, ResetPasswordInput, AuthResponse } from '@/types/authTypes'
import type { ErrorResponse } from '@/types/type'

// Utils Import
import axiosInstance from '@/utils/api/axiosInstance'
import { API_ROUTES } from '@/utils/constants/apiRoutes'
import {
  mapLoginData,
  mapRegisterData,
  mapResetPasswordData,
  mapForgotPasswordData,
  mapRefreshTokenData
} from './utility/auth'

export const useAuthHooks = () => {
  const router = useRouter()
  const { setToken } = useAuthStore()

  const useRegister = () => {
    const mutation = useMutation<AuthResponse, AxiosError<ErrorResponse>, RegisterType>({
      mutationFn: data => {
        const registerData = mapRegisterData(data)

        return axiosInstance.post('/api/auth/register/', registerData).then(response => response.data)
      },
      onSuccess: data => {
        const token = data?.refreshToken

        if (token) {
          setToken(token)
        }

        toast.success(data.message)
        router.push('/en/login/')
      },
      onError: error => {
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

  const useLogin = () => {
    const mutation = useMutation({
      mutationFn: (data: LoginInput) => {
        const loginData = mapLoginData(data)

        return axiosInstance.post('/api/auth/login/', loginData)
      },
      onSuccess: ({ data }) => {
        const token = data?.refreshToken

        if (token) {
          setToken(token)
        }

        toast.success(data?.message)
        router.push('/front-pages/landing-page')
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

  const useRefreshToken = () => {
    const mutation = useMutation({
      mutationFn: (token: string) => {
        const refreshData = mapRefreshTokenData(token)

        return axiosInstance.post('/api/auth/token/refresh/', refreshData)
      },
      onSuccess: ({ data }) => {
        const token = data?.access

        if (token) {
          setToken(token)
        }
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

  const useForgotPassword = () => {
    const mutation = useMutation({
      mutationFn: (email: string) => {
        const forgotPasswordData = mapForgotPasswordData(email)

        return axiosInstance.post('/api/auth/forgot-password/', forgotPasswordData)
      },
      onSuccess: ({ data }) => {
        toast.success(data?.message)
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

  const useResetPassword = () => {
    const mutation = useMutation({
      mutationFn: (data: ResetPasswordInput) => {
        const resetPasswordData = mapResetPasswordData(data)

        return axiosInstance.post('/api/auth/reset-password/', resetPasswordData)
      },
      onSuccess: ({ data }) => {
        toast.success(data?.message)
        router.push('/en/login/')
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

  const useCurrentUser = () => {
    return useQuery({
      queryKey: ['currentUser'],
      queryFn: () => axiosInstance.get('/api/auth/account/me/'),
      retry: false
    })
  }

  return {
    useRegister,
    useLogin,
    useRefreshToken,
    useForgotPassword,
    useResetPassword,
    useCurrentUser
  }
}
