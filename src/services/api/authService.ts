import { BaseService } from '../http/baseService'

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

  async logout(): Promise<void> {
    // Implementar logout se necessário
    return Promise.resolve()
  }
}

export const authService = new AuthService()
