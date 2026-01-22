import { BaseService } from '../http/baseService'
import axios from 'axios'
import { env } from '../../config/env'

export interface LoginCredentials {
  username: string
  password: string
}

export interface LoginResponse {
  access_token: string
  refresh_token: string
  expires_in: number
  refresh_expires_in: number
}

class AuthService extends BaseService {
  constructor() {
    super('/autenticacao')
  }

  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    return this.post<LoginResponse>('/login', credentials)
  }

  async refreshToken(refreshToken: string): Promise<LoginResponse> {
    // Para refresh, fazer requisição direta com axios para não passar pelo interceptor
    // que adicionaria o access token
    const response = await axios.post<LoginResponse>(
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
    return response.data
  }

  async logout(): Promise<void> {
    // Implementar logout se necessário
    return Promise.resolve()
  }
}

export const authService = new AuthService()
