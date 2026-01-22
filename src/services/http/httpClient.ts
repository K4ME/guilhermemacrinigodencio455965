import axios, { AxiosInstance, AxiosError, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios'
import { env } from '../../config/env'
import { ApiError, RequestConfig } from '../../types/api.types'

class HttpClient {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: env.apiBaseUrl,
      timeout: env.apiTimeout,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    this.setupInterceptors()
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        // Não adicionar token para endpoints de autenticação
        const isAuthEndpoint = config.url?.includes('/autenticacao')
        
        if (!isAuthEndpoint) {
          // Adicionar token de autenticação se existir
          const token = this.getAuthToken()
          if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`
          }
        }

        // Log de requisições em desenvolvimento
        if (import.meta.env.DEV) {
          console.log(`[HTTP Request] ${config.method?.toUpperCase()} ${config.url}`, {
            params: config.params,
            data: config.data,
          })
        }

        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        // Log de respostas em desenvolvimento
        if (import.meta.env.DEV) {
          console.log(`[HTTP Response] ${response.config.method?.toUpperCase()} ${response.config.url}`, {
            status: response.status,
            data: response.data,
          })
        }

        return response
      },
      (error: AxiosError) => {
        // Tratar erro 401 (não autorizado) - token expirado ou inválido
        if (error.response?.status === 401) {
          const isAuthEndpoint = error.config?.url?.includes('/autenticacao')
          
          // Se não for endpoint de autenticação, limpar token e tentar reautenticar
          if (!isAuthEndpoint) {
            this.removeAuthToken()
            // Disparar evento para o contexto de autenticação reautenticar
            window.dispatchEvent(new CustomEvent('auth:unauthorized'))
          }
        }

        const apiError = this.handleError(error)
        
        if (import.meta.env.DEV) {
          console.error(`[HTTP Error] ${error.config?.method?.toUpperCase()} ${error.config?.url}`, apiError)
        }

        return Promise.reject(apiError)
      }
    )
  }

  private handleError(error: AxiosError): ApiError {
    if (error.response) {
      // Erro com resposta do servidor
      const { data, status } = error.response
      
      return {
        message: (data as { message?: string })?.message || error.message,
        status,
        errors: (data as { errors?: Record<string, string[]> })?.errors,
      }
    }

    if (error.request) {
      // Erro de rede ou timeout
      return {
        message: 'Erro de conexão. Verifique sua internet e tente novamente.',
        status: 0,
      }
    }

    // Erro ao configurar a requisição
    return {
      message: error.message || 'Erro desconhecido',
    }
  }

  private getAuthToken(): string | null {
    // Implementar lógica para obter token do localStorage/sessionStorage
    return localStorage.getItem('auth_token')
  }

  public setAuthToken(token: string): void {
    localStorage.setItem('auth_token', token)
  }

  public removeAuthToken(): void {
    localStorage.removeItem('auth_token')
  }

  async get<T = unknown>(url: string, config?: RequestConfig): Promise<T> {
    const response = await this.client.get<T>(url, config as AxiosRequestConfig)
    return response.data
  }

  async post<T = unknown>(url: string, data?: unknown, config?: RequestConfig): Promise<T> {
    const response = await this.client.post<T>(url, data, config as AxiosRequestConfig)
    return response.data
  }

  async put<T = unknown>(url: string, data?: unknown, config?: RequestConfig): Promise<T> {
    const response = await this.client.put<T>(url, data, config as AxiosRequestConfig)
    return response.data
  }

  async patch<T = unknown>(url: string, data?: unknown, config?: RequestConfig): Promise<T> {
    const response = await this.client.patch<T>(url, data, config as AxiosRequestConfig)
    return response.data
  }

  async delete<T = unknown>(url: string, config?: RequestConfig): Promise<T> {
    const response = await this.client.delete<T>(url, config as AxiosRequestConfig)
    return response.data
  }
}

export const httpClient = new HttpClient()
