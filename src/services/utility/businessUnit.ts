import type { CreateBusinessUnitType, UpdateBusinessUnitType } from '@/types/businessUnitTypes'

export const mapCreateBusinessUnitData = (data: CreateBusinessUnitType) => ({
  name: data.name,
  description: data.description,
  max_active_users_limit: data.max_active_users_limit,
  max_clients_limit: data.max_clients_limit,
  notes: data.notes
})

export const mapUpdateBusinessUnitData = (data: UpdateBusinessUnitType) => {
  const updateData: Partial<CreateBusinessUnitType> = {}

  if (data.name) updateData.name = data.name
  if (data.description !== undefined) updateData.description = data.description
  if (data.max_active_users_limit !== undefined) updateData.max_active_users_limit = data.max_active_users_limit
  if (data.max_clients_limit !== undefined) updateData.max_clients_limit = data.max_clients_limit
  if (data.notes !== undefined) updateData.notes = data.notes

  return updateData
}
