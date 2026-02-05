import { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { vi } from 'vitest'
import { AuthProvider } from '../../contexts/AuthContext'
import { ThemeProvider } from '../../contexts/ThemeContext'

vi.mock('../../stores', async () => {
  const { BehaviorSubject } = await import('rxjs')
  const actual = (await vi.importActual('../../stores')) as Record<string, unknown>
  const authStore = actual.authStore as Record<string, unknown>

  const mockAuthState$ = new BehaviorSubject({
    isAuthenticated: true,
    isLoading: false,
    error: null,
  })

  return {
    ...actual,
    authStore: {
      ...authStore,
      initializeAuth: vi.fn().mockResolvedValue(undefined),
      authState$: mockAuthState$,
    },
  }
})

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>{children}</AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options })

export * from '@testing-library/react'
export { customRender as render }
