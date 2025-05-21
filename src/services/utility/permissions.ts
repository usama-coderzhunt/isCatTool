import type {
  AssignablePermissionType,
  ContentTypeResponse,
  UserPermissionAssignmentType,
  GroupPermissionAssignmentType
} from '@/types/userTypes'

export const mapUserPermissionAssignmentData = (data: UserPermissionAssignmentType) => {
  return {
    permissions: data.permission_ids
  }
}

export const mapGroupPermissionAssignmentData = (data: GroupPermissionAssignmentType) => {
  return {
    permissions: data.permission_ids
  }
}

export const mapAssignablePermissionsResponse = (data: AssignablePermissionType[]) => {
  return data
}

export const mapContentTypesResponse = (data: ContentTypeResponse[]) => {
  return data
}
