export interface ApiResponse<T = unknown> {
  data: T
  message?: string
  success?: boolean
}

export interface ApiError {
  message: string
  status?: number
  errors?: Record<string, string[]>
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface RequestConfig {
  params?: Record<string, unknown>
  headers?: Record<string, string>
  timeout?: number
}
