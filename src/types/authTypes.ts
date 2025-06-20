export interface RegisterType {
  username: string
  password: string
  password2: string
  email: string
  first_name: string
  last_name: string
}

export interface LoginInput {
  email: string
  password: string
}

export interface ResetPasswordInput {
  password: string
  reset_token: string
}

export interface AuthResponse {
  refreshToken: string
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
  }
  message?: string
}
