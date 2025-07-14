// Next Imports
import { useRouter } from 'next/navigation'

// React Imports
import { useParams } from 'next/navigation'

import { toast } from 'react-toastify'
import { useMutation } from '@tanstack/react-query'

// Axios Import
import type { AxiosError } from 'axios'

// Store Import
import { useAuthStore } from '@/store/useAuthStore'

// Types Import
import type { LoginResponse } from '@/types/loginType'

// Utils Import
import axiosInstance from '@/utils/api/axiosInstance'
import { API_ROUTES } from '@/utils/constants/apiRoutes'
import type { ErrorResponse } from '@/types/type'
import { mapLoginData, mapRegisterData } from './utility/user'
import type { LoginInput, RegisterType, ResetPasswordInput } from '@/types/authTypes'
import { cipher, decipher } from '@/utils/utility/decrypt'

export const useUserHooks = () => {
  const router = useRouter()
  const { setToken, setUserPermissions, setLoggedInUserDetails } = useAuthStore()
  const { lang } = useParams()

  const useRegisterUser = () => {
    const mutation = useMutation({
      mutationFn: (data: RegisterType) => {
        const useRegisterData = mapRegisterData(data)

        return axiosInstance.post(API_ROUTES.AUTH.userRegister, useRegisterData, {
          requiresAuth: false
        } as any)
      },
      onSuccess: ({ data }) => {
        toast.success(data.message)
        router.push(`/${lang}/login/`)
      },
      onError: (error: AxiosError<ErrorResponse>) => {
        const errorMessage = error.response?.data?.error || error.message || 'An unexpected error occurred.'

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
        const useLoginData = mapLoginData(data)

        return axiosInstance.post(API_ROUTES.AUTH.loginUrl, useLoginData)
      },
      onSuccess: async ({ data }: { data: LoginResponse }) => {
        const token = data?.accessToken
        const tokenExpiry = data?.tokenExpiry
        const userRole = data?.user?.role
        const isSuperuser = data?.user?.is_superuser
        const userID = data?.user?.id
        const userName = data?.user?.username

        if (token) {
          setToken(token)
          localStorage.setItem('tokenExpiry', tokenExpiry)
          localStorage.setItem('userRole', cipher(userRole))
          localStorage.setItem('userName', cipher(userName))
          localStorage.setItem('isSuperUser', cipher(isSuperuser))
          localStorage.setItem('userID', cipher(userID.toString()))

          if (!isSuperuser || userRole !== 'Admin') {
            const { data: loggedInUser } = await axiosInstance.get(API_ROUTES.AUTH.userDetails, {
              requiresAuth: true
            } as any)

            setUserPermissions(loggedInUser?.user_permissions || [])
          }
        }

        if (localStorage.getItem('returnUrl')) {
          const returnUrl = decipher(localStorage.getItem('returnUrl') || '')
          router.push(returnUrl)
        } else {
          router.push(`/${lang}/dashboard`)
        }
      },
      onError: (error: AxiosError<ErrorResponse>) => {
        let errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred.'
        if (/^non_field_errors:\s*/i.test(errorMessage)) {
          errorMessage = errorMessage.replace(/^non_field_errors:\s*/i, '')
        }
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
        return axiosInstance.post(API_ROUTES.AUTH.forgotPasswordUrl, {
          email: email
        })
      },
      onSuccess: ({ data }) => {
        toast.success(data?.message)
      },
      onError: (error: AxiosError<ErrorResponse>) => {
        const errorMessage = error.response?.data?.error || error.message || 'An unexpected error occurred.'

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
      mutationFn: ({ password, reset_token }: ResetPasswordInput) => {
        return axiosInstance.post(API_ROUTES.AUTH.resetPassword, { password, reset_token }, {
          requiresAuth: false
        } as any)
      },
      onSuccess: ({ data }) => {
        toast.success(data?.message)
        router.push(`/${lang}/login/`)
      },
      onError: (error: AxiosError<ErrorResponse>) => {
        const errorMessage =
          error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          'An unexpected error occurred.'

        toast.error(errorMessage)
        router.push(`/${lang}/pages/auth/forgot-password?message=${encodeURIComponent(errorMessage)}`)
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

  const useLoggedInUserResetPassword = () => {
    const mutation = useMutation({
      mutationFn: (data: { current_password: string; password: string }) => {
        return axiosInstance.post(API_ROUTES.AUTH.resetPassword, data, {
          requiresAuth: true
        } as any)
      },
      onSuccess: ({ data }) => {
        toast.success(data?.message)
        router.push(`/${lang}/login/`)
      },
      onError: (error: AxiosError<ErrorResponse>) => {
        const errorMessage =
          error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          'An unexpected error occurred.'

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
    useRegisterUser,
    useLogin,
    useForgotPassword,
    useResetPassword,
    useLoggedInUserResetPassword
  }
}
