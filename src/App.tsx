import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom'
import { PetList } from './components/PetList'
import { TutorList } from './components/TutorList'
import { PetDetail } from './pages/PetDetail'
import { PetFormPage } from './pages/PetFormPage'
import { TutorDetail } from './pages/TutorDetail'
import { TutorFormPage } from './pages/TutorFormPage'
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
      <AppContent />
    </BrowserRouter>
  )
}

const AppContent = () => {
  const location = useLocation()

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 overflow-x-hidden">
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="min-w-0">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white break-words">
                Pet Manager
              </h1>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 break-words">
                Gerencie seus pets e tutores de forma simples e eficiente
              </p>
            </div>
            <nav className="flex gap-4 flex-shrink-0">
              <Link
                to="/pets"
                className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                  location.pathname.startsWith('/pets')
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                Pets
              </Link>
              <Link
                to="/tutores"
                className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                  location.pathname.startsWith('/tutores')
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                Tutores
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full min-w-0">
        <Routes>
          <Route path="/" element={<Navigate to="/pets" replace />} />
          <Route path="/pets" element={<PetList />} />
          <Route path="/pets/new" element={<PetFormPage />} />
          <Route path="/pets/:id" element={<PetDetail />} />
          <Route path="/pets/:id/edit" element={<PetFormPage />} />
          <Route path="/tutores" element={<TutorList />} />
          <Route path="/tutores/new" element={<TutorFormPage />} />
          <Route path="/tutores/:id" element={<TutorDetail />} />
          <Route path="/tutores/:id/edit" element={<TutorFormPage />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
