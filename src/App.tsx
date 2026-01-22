import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { PetList } from './components/PetList'
import { PetDetail } from './pages/PetDetail'
import { PetFormPage } from './pages/PetFormPage'
import { useAuth } from './contexts/AuthContext'

const App = () => {
  const { isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Autenticando...</p>
        </div>
      </div>
    )
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <header className="bg-white dark:bg-gray-800 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Pet Manager
            </h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
              Gerencie seus pets de forma simples e eficiente
            </p>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Routes>
            <Route path="/" element={<Navigate to="/pets" replace />} />
            <Route path="/pets" element={<PetList />} />
            <Route path="/pets/new" element={<PetFormPage />} />
            <Route path="/pets/:id" element={<PetDetail />} />
            <Route path="/pets/:id/edit" element={<PetFormPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App
