import { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import { LoadingSpinner } from './components/LoadingSpinner'
import { Header } from './components/Header'

const PetList = lazy(() => import('./components/PetList').then(module => ({ default: module.PetList })))
const PetDetail = lazy(() => import('./pages/PetDetail').then(module => ({ default: module.PetDetail })))
const PetFormPage = lazy(() => import('./pages/PetFormPage').then(module => ({ default: module.PetFormPage })))

const TutorList = lazy(() => import('./components/TutorList').then(module => ({ default: module.TutorList })))
const TutorDetail = lazy(() => import('./pages/TutorDetail').then(module => ({ default: module.TutorDetail })))
const TutorFormPage = lazy(() => import('./pages/TutorFormPage').then(module => ({ default: module.TutorFormPage })))

const App = () => {
  const { isLoading } = useAuth()

  if (isLoading) {
    return <LoadingSpinner message="Autenticando..." fullScreen />
  }

  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  )
}

const AppContent = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 overflow-x-hidden">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full min-w-0">
        <Suspense fallback={<LoadingSpinner />}>
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
        </Suspense>
      </main>
    </div>
  )
}

export default App
