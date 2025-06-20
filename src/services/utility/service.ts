import type { CreateServiceType, CreateTransService } from '@/types/services'

export const mapTransServiceData = (data: CreateTransService) => {
  return { ...data }
}

export const mapServiceData = (data: CreateServiceType) => {
  return { ...data }
}
