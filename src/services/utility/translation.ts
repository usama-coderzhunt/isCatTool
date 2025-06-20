import type {
  CreateTranslationModelType,
  CreateLanguageType,
  CreateTranslationMemoryType,
  CreateTranslationMemoryEntryType
} from '@/types/translation'

export const mapCreateTranslationModelData = (data: CreateTranslationModelType) => ({
  name: data.name,
  model_name: data.model_name,
  description: data.description,
  operator: data.operator,
  allowed_users: data.allowed_users,
  allowed_groups: data.allowed_groups
})

export const mapCreateLanguageData = (data: CreateLanguageType) => ({
  name: data.name,
  code: data.code
})

export const mapCreateTranslationMemoryData = (data: CreateTranslationMemoryType) => ({
  name: data.name,
  description: data.description,
  source_language: data.source_language,
  target_language: data.target_language
})

export const mapCreateTranslationMemoryEntryData = (data: CreateTranslationMemoryEntryType) => ({
  source_text: data.source_text,
  target_text: data.target_text,
  reference: data.reference,
  translation_memory: data.translation_memory
})
