import type { CreateStaffPositionInput, CreateStaffInput, UpdateStaffInput, CreateStaff } from '@/types/staffTypes'

export const mapCreateStaffPositionData = (data: CreateStaffPositionInput) => ({
  name: data.name
})

export const mapCreateStaffData = (data: CreateStaffInput) => ({
  username: data.username,
  first_name: data.first_name,
  last_name: data.last_name,
  email: data.email,
  phone_number: data.phone_number,
  address: data.address,
  password: data.password,
  password2: data.password2,
  position: data.position,
  is_active: data.is_active,
  user: data.user,
})

export const mapCreateStaff = (data: CreateStaff) => ({
  first_name: data.first_name,
  middle_name: data.middle_name,
  last_name: data.last_name,
  email: data.email,
  phone_number: data.phone_number,
  position: data.position,
})

export const mapUpdateStaffData = (data: UpdateStaffInput) => {
  const updateData: Partial<CreateStaffInput> = {}

  if (data.first_name) updateData.first_name = data.first_name
  if (data.username !== undefined) updateData.username = data.username
  if (data.middle_name !== undefined) updateData.middle_name = data.middle_name
  if (data.last_name) updateData.last_name = data.last_name
  if (data.email) updateData.email = data.email
  if (data.phone_number) updateData.phone_number = data.phone_number
  if (data.is_active !== undefined) updateData.is_active = data.is_active
  if (data.position !== undefined) updateData.position = data.position
  if (data.user !== undefined) updateData.user = data.user
  if (data.password) updateData.password = data.password
  if (data.password2) updateData.password2 = data.password2

  return updateData
}
