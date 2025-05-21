export type LoginInput = {
  email: string
  password: string
}

export interface LoginResponse {
  refreshToken: string
  message: string
  accessToken: string
  tokenExpiry: string
  user: {
    id: number
    username: string
    email: string
    first_name: string
    last_name: string
    is_staff: boolean
    role: string
    is_superuser: boolean
  }
}
