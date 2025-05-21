import type { LoginInput, RegisterType, ResetPasswordInput } from '@/types/authTypes'

export const mapRegisterData = (data: RegisterType) => ({
  username: data.username,
  password: data.password,
  password2: data.password,
  email: data.email,
  first_name: data.first_name,
  last_name: data.last_name
})

export const mapLoginData = (data: LoginInput) => ({
  username_or_email: data.email,
  password: data.password
})

export const mapResetPasswordData = (data: ResetPasswordInput) => ({
  password: data.password,
  reset_token: data.reset_token
})

export const mapForgotPasswordData = (email: string) => ({
  email
})

export const mapRefreshTokenData = (token: string) => ({
  refresh: token
})
