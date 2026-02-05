import { BrowserRouter } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { LoadingSpinner } from './components/LoadingSpinner'
import { Header } from './components/Header'
import { AppRoutes } from './routes/AppRoutes'

const App = () => {
  const { isLoading } = useAuth()

  if (isLoading) {
    return <LoadingSpinner message="Autenticando..." fullScreen />
  }

  return (
    <BrowserRouter>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </BrowserRouter>
  )
}

const AppContent = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 overflow-x-hidden">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full min-w-0">
        <AppRoutes />
      </main>
    </div>
  )
}

export default App
