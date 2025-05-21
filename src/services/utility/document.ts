import type { CreateDocumentTypeInput, CreateDocumentInput } from '@/types/documentTypes'

export const mapCreateDocumentTypeData = (data: CreateDocumentTypeInput) => ({
  ...data
})

export const mapCreateDocumentData = (data: CreateDocumentInput) => ({
  ...data
})
