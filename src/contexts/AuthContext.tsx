import { createContext, useContext, useEffect, ReactNode } from 'react'
import { authStore } from '../stores'
import { useStore } from '../hooks/useStore'
import type { LoginCredentials, LoginResponse } from '../services/facade'
import { httpClient } from '../services/http'

interface AuthContextType {
  isAuthenticated: boolean
  isLoading: boolean
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const authState = useStore(authStore.authState$)

  useEffect(() => {
    authStore.initializeAuth()

    const handleRefreshSuccess = (event: CustomEvent<LoginResponse>) => {
      const expiryTime = Date.now() + event.detail.expires_in * 1000
      localStorage.setItem('auth_token', event.detail.access_token)
      localStorage.setItem('refresh_token', event.detail.refresh_token)
      localStorage.setItem('token_expiry', expiryTime.toString())
      httpClient.setAuthToken(event.detail.access_token)
      httpClient.setRefreshToken(event.detail.refresh_token)
    }

    const handleUnauthorized = async () => {
      try {
        const response = await authStore.login({ username: 'admin', password: 'admin' })
        window.dispatchEvent(new CustomEvent('auth:reauth-success', { detail: response }))
      } catch (error) {
        console.error('Erro ao reautenticar:', error)
        authStore.logout()
        window.dispatchEvent(new CustomEvent('auth:reauth-failure'))
      }
    }

    window.addEventListener('auth:refresh-success', handleRefreshSuccess as EventListener)
    window.addEventListener('auth:unauthorized', handleUnauthorized)

    return () => {
      window.removeEventListener('auth:refresh-success', handleRefreshSuccess as EventListener)
      window.removeEventListener('auth:unauthorized', handleUnauthorized)
    }
  }, [])

  const login = async (credentials: LoginCredentials) => {
    await authStore.login(credentials)
  }

  const logout = () => {
    authStore.logout()
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: authState.isAuthenticated,
        isLoading: authState.isLoading,
        login,
        logout,
      }}
    >
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
