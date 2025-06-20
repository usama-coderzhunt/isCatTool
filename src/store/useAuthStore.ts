import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import Cookies from 'js-cookie'
interface IAuthProps {
  token: any
  user: null | []
  userPermissions: Array<{ codename: string }>
  loggedInUser: { userName: string; userRole: string }
  logout: () => void
  setToken: (token: string) => void
  setUserPermissions: (permissions: Array<{ codename: string }>) => void
  setLoggedInUserDetails: (userName: string, userRole: string) => void
}

export const useAuthStore = create<IAuthProps>()(
  persist(
    set => ({
      token: typeof window !== 'undefined' ? Cookies.get('accessToken') : null,
      user: null,
      userPermissions: [],
      loggedInUser: { userName: '', userRole: '' },

      logout: () => {
        localStorage.clear()
        Cookies.remove('accessToken')
        Cookies.remove('refreshToken')
        set({ token: null, user: null, userPermissions: [] })
        window.location.replace('/en/login/')
      },

      setToken: (token: string) => {
        Cookies.set('accessToken', token)
        set({ token })
      },

      setUserPermissions: (permissions: Array<{ codename: string }>) => set({ userPermissions: permissions }),

      setLoggedInUserDetails: (userName: string, userRole: string) => {
        set({ loggedInUser: { userName, userRole } })
      }
    }),
    {
      name: 'user-permissions',
      storage: createJSONStorage(() => localStorage),
      partialize: state => ({ userPermissions: state.userPermissions })
    }
  )
)
