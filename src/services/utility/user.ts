import { LoginInput, RegisterType, ResetPasswordInput } from '@/types/authTypes'
import type {
  CreateUserType,
  UpdateUserType,
  CreateGroupType,
  UserGroupAssignmentType,
  UserPermissionAssignmentType,
  GroupPermissionAssignmentType
} from '@/types/userTypes'

export const mapRegisterData = (data: RegisterType) => {
  return {
    username: data.username,
    password: data.password,
    password2: data.password,
    first_name: data.username,
    last_name: data.username,
    email: data.email
  }
}

export const mapLoginData = (data: LoginInput) => {
  return {
    username_or_email: data.email,
    password: data.password
  }
}

export const mapResetPasswordData = (data: ResetPasswordInput) => {
  return {
    password: data.password,
    reset_token: data.reset_token
  }
}

export const mapCreateUserData = (data: CreateUserType) => ({
  username: data.username,
  email: data.email,
  first_name: data.first_name,
  last_name: data.last_name,
  password: data.password
})

export const mapUpdateUserData = (data: UpdateUserType) => {
  const updateData: Partial<CreateUserType> = {}

  if (data.username) updateData.username = data.username
  if (data.email) updateData.email = data.email
  if (data.first_name) updateData.first_name = data.first_name
  if (data.last_name) updateData.last_name = data.last_name
  if (data.password) updateData.password = data.password

  return updateData
}

export const mapCreateGroupData = (data: CreateGroupType) => ({
  name: data.name
})

export const mapUserGroupAssignmentData = (data: UserGroupAssignmentType) => ({
  groups: data.group_ids
})

export const mapUserPermissionAssignmentData = (data: UserPermissionAssignmentType) => ({
  permissions: data.permission_ids
})

export const mapGroupPermissionAssignmentData = (data: GroupPermissionAssignmentType) => ({
  permissions: data.permission_ids
})
