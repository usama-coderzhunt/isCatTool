import { ServicePlanTypes } from './servicesPlans'

export interface CreateServiceType {
  name: string
  description: string | null
  service_type: string
  price: number | null
  categories: number[]
  clients: number[]
}

export interface CreateTransService {
  order_date: string | null
  communication_platform: string | null
  translation_type: string | null
  marketing_funnel: string | null
  reason_of_refuse: string | null
  source_language: string | null
  target_language: string | null
  priority: string | null
  cost: number | null
  trans_client: number
  clientId: number
}

export interface ServiceTypes {
  id: number
  name: string
  slug: string
  description: string
  short_description: string
  image: string
  categories: number[]
  features_list: Record<string, string>
  limit_list: Record<string, string>
  additional_info: {
    badge_text: string | null
    badge_color: string | null
    additional_information: string | null
  }
  created_at: string
  updated_at: string
  created_by: number
  updated_by: number
  plans: ServicePlanTypes[]
  faq?: Record<string, string>
}
