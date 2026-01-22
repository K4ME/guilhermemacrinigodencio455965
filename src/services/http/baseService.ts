import { httpClient } from './httpClient'
import { RequestConfig, PaginatedResponse } from '../../types/api.types'

export abstract class BaseService {
  protected baseUrl: string

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  protected async get<T = unknown>(endpoint: string = '', config?: RequestConfig): Promise<T> {
    return httpClient.get<T>(`${this.baseUrl}${endpoint}`, config)
  }

  protected async post<T = unknown>(
    endpoint: string = '',
    data?: unknown,
    config?: RequestConfig
  ): Promise<T> {
    return httpClient.post<T>(`${this.baseUrl}${endpoint}`, data, config)
  }

  protected async put<T = unknown>(
    endpoint: string = '',
    data?: unknown,
    config?: RequestConfig
  ): Promise<T> {
    return httpClient.put<T>(`${this.baseUrl}${endpoint}`, data, config)
  }

  protected async patch<T = unknown>(
    endpoint: string = '',
    data?: unknown,
    config?: RequestConfig
  ): Promise<T> {
    return httpClient.patch<T>(`${this.baseUrl}${endpoint}`, data, config)
  }

  protected async delete<T = unknown>(endpoint: string = '', config?: RequestConfig): Promise<T> {
    return httpClient.delete<T>(`${this.baseUrl}${endpoint}`, config)
  }

  protected async getPaginated<T = unknown>(
    endpoint: string = '',
    page: number = 1,
    limit: number = 10,
    config?: RequestConfig
  ): Promise<PaginatedResponse<T>> {
    return this.get<PaginatedResponse<T>>(endpoint, {
      ...config,
      params: {
        ...config?.params,
        page,
        limit,
      },
    })
  }
}
