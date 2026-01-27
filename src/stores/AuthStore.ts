import { BehaviorSubject, Observable } from 'rxjs'
import { BaseStore, StoreState } from './BaseStore'
import { apiFacade } from '../services/facade'
import type { LoginCredentials, LoginResponse } from '../services/facade'
import { httpClient } from '../services/http'

interface AuthState {
  isAuthenticated: boolean
  isLoading: boolean
  error: any | null
}

class AuthStore extends BaseStore<LoginResponse> {
  private _authState$ = new BehaviorSubject<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    error: null,
  })

  get authState$(): Observable<AuthState> {
    return this._authState$.asObservable()
  }

  get authState(): AuthState {
    return this._authState$.getValue()
  }

  get isAuthenticated(): boolean {
    return this._authState$.getValue().isAuthenticated
  }

  get isLoading(): boolean {
    return this._authState$.getValue().isLoading
  }

  private setAuthState(partialState: Partial<AuthState>): void {
    const currentState = this._authState$.getValue()
    this._authState$.next({ ...currentState, ...partialState })
  }

  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    this.setAuthState({ isLoading: true, error: null })

    try {
      const response = await apiFacade.auth.login(credentials)
      this.saveTokens(response)
      this.setAuthState({ isAuthenticated: true, isLoading: false, error: null })
      return response
    } catch (error) {
      this.clearTokens()
      this.setAuthState({ isAuthenticated: false, isLoading: false, error })
      throw error
    }
  }

  logout(): void {
    this.clearTokens()
    this.setAuthState({ isAuthenticated: false, isLoading: false, error: null })
  }

  private saveTokens(response: LoginResponse): void {
    const expiryTime = Date.now() + response.expires_in * 1000

    localStorage.setItem('auth_token', response.access_token)
    localStorage.setItem('refresh_token', response.refresh_token)
    localStorage.setItem('token_expiry', expiryTime.toString())

    httpClient.setAuthToken(response.access_token)
    httpClient.setRefreshToken(response.refresh_token)
  }

  private clearTokens(): void {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('token_expiry')

    httpClient.removeAllTokens()
  }

  private checkTokenValidity(): boolean {
    const token = localStorage.getItem('auth_token')
    const expiryTime = localStorage.getItem('token_expiry')

    if (!token || !expiryTime) {
      return false
    }

    const isExpired = Date.now() >= parseInt(expiryTime, 10)
    return !isExpired
  }

  async initializeAuth(): Promise<void> {
    this.setAuthState({ isLoading: true })

    if (this.checkTokenValidity()) {
      const token = localStorage.getItem('auth_token')
      if (token) {
        httpClient.setAuthToken(token)
        this.setAuthState({ isAuthenticated: true, isLoading: false })
      }
    } else {
      try {
        const response = await apiFacade.auth.login({ username: 'admin', password: 'admin' })
        this.saveTokens(response)
        this.setAuthState({ isAuthenticated: true, isLoading: false })
      } catch (error) {
        console.error('Erro ao fazer login automático:', error)
        this.clearTokens()
        this.setAuthState({ isAuthenticated: false, isLoading: false })
      }
    }
  }
}

export const authStore = new AuthStore({
  data: null,
  loading: false,
  error: null,
})
