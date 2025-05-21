// Version Types
export interface VersionType {
  id: number
  entity_type: string
  entity_id: number
  version_number: number
  changes: Record<string, any>
  metadata: {
    author: number
    timestamp: string
    comment?: string
  }
  parent_version?: number
  branch_name?: string
  status: 'current' | 'historical' | 'draft'
  created_at: string
  created_by?: number
}

export interface CreateVersionType {
  entity_type: string
  entity_id: number
  changes: Record<string, any>
  comment?: string
  branch_name?: string
}

export interface CompareVersionsType {
  version1_id: number
  version2_id: number
}

export interface VersionHistoryType {
  versions: VersionType[]
  total_versions: number
  current_version: number
}

export interface VersionBranchType {
  id: number
  name: string
  base_version: number
  status: 'active' | 'merged' | 'abandoned'
  created_at: string
  created_by?: number
}
