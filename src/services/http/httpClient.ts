import axios, { AxiosInstance, AxiosError, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios'
import { env } from '../../config/env'
import { ApiError, RequestConfig } from '../../types/api.types'
import type { LoginResponse } from '../facade'

class HttpClient {
  private client: AxiosInstance
  private isRefreshing = false
  private isReauthenticating = false
  private failedQueue: Array<{
    resolve: (value?: unknown) => void
    reject: (error?: unknown) => void
  }> = []
  private reauthQueue: Array<{
    resolve: (value?: unknown) => void
    reject: (error?: unknown) => void
  }> = []

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
        // Não adicionar token para endpoints de autenticação (exceto refresh)
        const isAuthEndpoint = config.url?.includes('/autenticacao')
        const isRefreshEndpoint = config.url?.includes('/autenticacao/refresh')
        
        if (!isAuthEndpoint || isRefreshEndpoint) {
          // Se for refresh, usar refresh token do header se já estiver definido
          // Caso contrário, adicionar access token
          if (!isRefreshEndpoint) {
            const token = this.getAuthToken()
            if (token && config.headers) {
              config.headers.Authorization = `Bearer ${token}`
            }
          }
        }

        // Se for FormData, remover Content-Type para o navegador definir o boundary
        if (config.data instanceof FormData && config.headers) {
          delete config.headers['Content-Type']
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
      async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

        // Tratar erro 401 (não autorizado) - token expirado ou inválido
        if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
          const isAuthEndpoint = originalRequest.url?.includes('/autenticacao')
          const isRefreshEndpoint = originalRequest.url?.includes('/autenticacao/refresh')
          
          // Se não for endpoint de autenticação, tentar refresh
          if (!isAuthEndpoint && !isRefreshEndpoint) {
            originalRequest._retry = true

            // Se já está fazendo refresh, adicionar à fila
            if (this.isRefreshing) {
              return new Promise((resolve, reject) => {
                this.failedQueue.push({ resolve, reject })
              })
                .then(() => {
                  return this.client(originalRequest)
                })
                .catch((err) => {
                  return Promise.reject(err)
                })
            }

            this.isRefreshing = true
            const refreshToken = this.getRefreshToken()

            if (refreshToken) {
              try {
                // Fazer refresh do token diretamente
                const refreshResponse = await axios.post<LoginResponse>(
                  `${env.apiBaseUrl}/autenticacao/refresh`,
                  undefined,
                  {
                    headers: {
                      Authorization: `Bearer ${refreshToken}`,
                      'Content-Type': 'application/json',
                    },
                    timeout: env.apiTimeout,
                  }
                )

                // Salvar novos tokens
                const newTokens = refreshResponse.data
                this.setAuthToken(newTokens.access_token)
                this.setRefreshToken(newTokens.refresh_token)
                
                // Notificar contexto sobre o refresh bem-sucedido
                window.dispatchEvent(new CustomEvent('auth:refresh-success', { detail: newTokens }))
                
                // Processar fila de requisições pendentes
                this.processQueue(null)
                this.isRefreshing = false

                // Retentar a requisição original com novo token
                if (originalRequest.headers) {
                  originalRequest.headers.Authorization = `Bearer ${newTokens.access_token}`
                }
                return this.client(originalRequest)
              } catch (refreshError) {
                // Se refresh falhar, tentar reautenticação
                this.isRefreshing = false
                return this.handleReauthentication(originalRequest)
              }
            } else {
              // Sem refresh token, tentar reautenticação
              this.isRefreshing = false
              return this.handleReauthentication(originalRequest)
            }
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

  private processQueue(error: unknown): void {
    this.failedQueue.forEach((promise) => {
      if (error) {
        promise.reject(error)
      } else {
        promise.resolve()
      }
    })
    this.failedQueue = []
  }

  private processReauthQueue(error: unknown): void {
    this.reauthQueue.forEach((promise) => {
      if (error) {
        promise.reject(error)
      } else {
        promise.resolve()
      }
    })
    this.reauthQueue = []
  }

  private handleReauthentication(originalRequest: InternalAxiosRequestConfig): Promise<unknown> {
    // Se já está fazendo reautenticação, adicionar à fila
    if (this.isReauthenticating) {
      return new Promise((resolve, reject) => {
        this.reauthQueue.push({ resolve, reject })
      })
        .then(() => {
          return this.client(originalRequest)
        })
        .catch((err) => {
          return Promise.reject(err)
        })
    }

    this.isReauthenticating = true
    this.removeAllTokens()

    // Disparar evento para reautenticação
    const reauthPromise = new Promise<LoginResponse>((resolve, reject) => {
      const timeout = setTimeout(() => {
        window.removeEventListener('auth:reauth-success', successListener)
        window.removeEventListener('auth:reauth-failure', failureListener)
        reject(new Error('Timeout aguardando reautenticação'))
      }, 10000) // 10 segundos de timeout

      const successListener: EventListener = (ev) => {
        clearTimeout(timeout)
        window.removeEventListener('auth:reauth-success', successListener)
        window.removeEventListener('auth:reauth-failure', failureListener)
        resolve((ev as CustomEvent<LoginResponse>).detail)
      }

      const failureListener: EventListener = () => {
        clearTimeout(timeout)
        window.removeEventListener('auth:reauth-success', successListener)
        window.removeEventListener('auth:reauth-failure', failureListener)
        reject(new Error('Falha na reautenticação'))
      }

      window.addEventListener('auth:reauth-success', successListener)
      window.addEventListener('auth:reauth-failure', failureListener)
    })

    window.dispatchEvent(new CustomEvent('auth:unauthorized'))

    return reauthPromise
      .then((newTokens) => {
        // Salvar novos tokens
        this.setAuthToken(newTokens.access_token)
        this.setRefreshToken(newTokens.refresh_token)

        // Processar fila de requisições pendentes
        this.processReauthQueue(null)
        this.isReauthenticating = false

        // Retentar a requisição original com novo token
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newTokens.access_token}`
        }
        return this.client(originalRequest)
      })
      .catch((reauthError) => {
        // Se reautenticação falhar, processar fila com erro
        this.processReauthQueue(reauthError)
        this.isReauthenticating = false
        return Promise.reject(reauthError)
      })
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
    return localStorage.getItem('auth_token')
  }

  public getRefreshToken(): string | null {
    return localStorage.getItem('refresh_token')
  }

  public setAuthToken(token: string): void {
    localStorage.setItem('auth_token', token)
  }

  public setRefreshToken(token: string): void {
    localStorage.setItem('refresh_token', token)
  }

  public removeAuthToken(): void {
    localStorage.removeItem('auth_token')
  }

  public removeRefreshToken(): void {
    localStorage.removeItem('refresh_token')
  }

  public removeAllTokens(): void {
    this.removeAuthToken()
    this.removeRefreshToken()
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
