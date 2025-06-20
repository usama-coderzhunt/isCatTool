export interface ErrorResponse {
  message: string
  detail: string
  error?: string
  coupon?: {
    string: string
    code: string
  }
}
