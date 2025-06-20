import axios from 'axios'
import { hasPermissions } from '../permissionUtils'
import { useAuthStore } from '@/store/useAuthStore'
import { toast } from 'react-toastify'
import Cookies from 'js-cookie'
import { getDecryptedLocalStorage } from '../utility/decrypt'

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL
const axiosInstance = axios.create({
  baseURL: baseUrl
})

axiosInstance.interceptors.request.use(
  function (config: any) {
    // const token = Cookies.get('accessToken')
    const authStore = useAuthStore.getState()
    const token = authStore.token

    const userPermissions = useAuthStore.getState().userPermissions
    if (!config.headers['Content-Type']) {
      config.headers['Content-Type'] = 'application/json'
    }

    const requiresAuth = config?.requiresAuth ?? true
    const requiredPermission = config?.requiredPermission
    const hasPermission = hasPermissions(userPermissions, [requiredPermission])

    const isAdmin = getDecryptedLocalStorage('userRole') === 'Admin'
    const adminOnly = config?.adminOnly

    if (Boolean(config.requiredPermission) && !hasPermission) {
      toast.error('You do not have permission to perform this action.')
      return Promise.reject(new Error('Permission denied'))
    }

    if (adminOnly && !isAdmin) {
      toast.error('This action is restricted to administrators only.')
      Promise.reject(new Error('Admin access required'))
      return
    }

    if (requiresAuth && token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`
      }
    }
    return config
  },
  function (error) {
    toast.error('Permission denied')
    return Promise.reject(error)
  }
)

axiosInstance.interceptors.response.use(
  response => response,
  error => {
    if (error.response) {
      const { status, data } = error.response

      console.error('Server Error:', {
        status,
        data,
        url: error.config?.url
      })

      if (status === 401) {
        toast.error('Session expired. Redirecting to login...')
        Cookies.remove('accessToken')
        Cookies.remove('refreshToken')
        useAuthStore.getState().logout?.()
        setTimeout(() => {
          window.location.href = '/en/login/'
        }, 1500)
      } else if (status === 403) {
        toast.error('Access denied.')
      } else {
        let errorMessage = data?.message
        if (/^non_field_errors:\s*/i.test(errorMessage)) {
          errorMessage = errorMessage.replace(/^non_field_errors:\s*/i, '')
        }
      }
    } else if (error.request) {
      console.error('Network Error: No response received', error.request)
      toast.error('No response from server. Please check your network.')
    } else {
      console.error('Client Error: Request setup failed', error.message)
      toast.error('An error occurred before the request was sent.')
    }

    return Promise.reject(error)
  }
)

export default axiosInstance
