export interface DocumentType {
  id: number
  name: string
  created_at: string
  updated_at: string
  created_by?: number
  updated_by?: number
}

export interface CreateDocumentTypeInput {
  name: string
}

export interface Document {
  id: number
  document_type: number
  note?: string
  expiration_date?: string
  created_at: string
  updated_at: string
  created_by?: number
  updated_by?: number
  clients: string
  cases: string
  client_info?: any[]
}

export interface CreateDocumentInput {
  document_type: string | null
  note: string | null
  file?: File | any
  client_list?: number[]
  case_list?: number[]
  name?: string
  client_info?: any[]
}
