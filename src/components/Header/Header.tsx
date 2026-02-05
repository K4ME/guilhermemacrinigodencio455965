import { Link, useLocation } from 'react-router-dom'
import { useTheme } from '../../contexts/ThemeContext'

const Header = () => {
  const location = useLocation()
  const { theme, toggleTheme } = useTheme()

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-1.5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="min-w-0 flex items-center justify-center sm:justify-start">
            <img
              src="/petmanager-logo.png"
              alt="PetManager - Gerencie seus pets e tutores de forma simples e eficiente"
              className="h-12 sm:h-10 md:h-12 w-auto object-contain block"
            />
          </div>
          <div className="flex items-center gap-4 sm:gap-6">
            <nav className="flex items-center gap-6 sm:gap-8 flex-shrink-0">
              <Link
                to="/pets"
                className={`relative py-2 text-sm font-medium transition-colors whitespace-nowrap border-b-2 border-transparent hover:text-gray-900 dark:hover:text-white ${
                  location.pathname.startsWith('/pets')
                    ? 'text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-400'
                    : 'text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                Pets
              </Link>
              <Link
                to="/tutores"
                className={`relative py-2 text-sm font-medium transition-colors whitespace-nowrap border-b-2 border-transparent hover:text-gray-900 dark:hover:text-white ${
                  location.pathname.startsWith('/tutores')
                    ? 'text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-400'
                    : 'text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                Tutores
              </Link>
            </nav>
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? 'Ativar modo claro' : 'Ativar modo escuro'}
              className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              {theme === 'dark' ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
