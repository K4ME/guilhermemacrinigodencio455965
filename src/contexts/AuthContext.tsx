import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { apiFacade } from '../services/facade'
import type { LoginCredentials, LoginResponse } from '../services/facade'
import { httpClient } from '../services/http'

interface AuthContextType {
  isAuthenticated: boolean
  isLoading: boolean
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const TOKEN_KEY = 'auth_token'
const REFRESH_TOKEN_KEY = 'refresh_token'
const TOKEN_EXPIRY_KEY = 'token_expiry'

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const saveTokens = useCallback((response: LoginResponse) => {
    const expiryTime = Date.now() + response.expires_in * 1000
    
    localStorage.setItem(TOKEN_KEY, response.access_token)
    localStorage.setItem(REFRESH_TOKEN_KEY, response.refresh_token)
    localStorage.setItem(TOKEN_EXPIRY_KEY, expiryTime.toString())
    
    httpClient.setAuthToken(response.access_token)
    httpClient.setRefreshToken(response.refresh_token)
    setIsAuthenticated(true)
  }, [])

  const clearTokens = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
    localStorage.removeItem(TOKEN_EXPIRY_KEY)
    
    httpClient.removeAllTokens()
    setIsAuthenticated(false)
  }, [])

  const checkTokenValidity = useCallback((): boolean => {
    const token = localStorage.getItem(TOKEN_KEY)
    const expiryTime = localStorage.getItem(TOKEN_EXPIRY_KEY)
    
    if (!token || !expiryTime) {
      return false
    }
    
    const isExpired = Date.now() >= parseInt(expiryTime, 10)
    return !isExpired
  }, [])

  const login = useCallback(async (credentials: LoginCredentials) => {
    try {
      const response = await apiFacade.auth.login(credentials)
      saveTokens(response)
    } catch (error) {
      clearTokens()
      throw error
    }
  }, [saveTokens, clearTokens])

  const logout = useCallback(() => {
    clearTokens()
  }, [clearTokens])

  useEffect(() => {
    const initializeAuth = async () => {
      setIsLoading(true)
      
      if (checkTokenValidity()) {
        const token = localStorage.getItem(TOKEN_KEY)
        if (token) {
          httpClient.setAuthToken(token)
          setIsAuthenticated(true)
        }
      } else {
        try {
          const response = await apiFacade.auth.login({ username: 'admin', password: 'admin' })
          saveTokens(response)
        } catch (error) {
          console.error('Erro ao fazer login automático:', error)
          clearTokens()
        }
      }
      
      setIsLoading(false)
    }

    const handleRefreshSuccess = (event: CustomEvent<LoginResponse>) => {
      saveTokens(event.detail)
    }

    const handleUnauthorized = async () => {
      try {
        const response = await apiFacade.auth.login({ username: 'admin', password: 'admin' })
        saveTokens(response)
        window.dispatchEvent(new CustomEvent('auth:reauth-success', { detail: response }))
      } catch (error) {
        console.error('Erro ao reautenticar:', error)
        clearTokens()
        window.dispatchEvent(new CustomEvent('auth:reauth-failure'))
      }
    }

    initializeAuth()
    
    window.addEventListener('auth:refresh-success', handleRefreshSuccess as EventListener)
    window.addEventListener('auth:unauthorized', handleUnauthorized)
    
    return () => {
      window.removeEventListener('auth:refresh-success', handleRefreshSuccess as EventListener)
      window.removeEventListener('auth:unauthorized', handleUnauthorized)
    }
  }, [checkTokenValidity, saveTokens, clearTokens])

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider')
  }
  return context
}
