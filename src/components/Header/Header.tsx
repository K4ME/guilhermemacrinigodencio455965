import { Link, useLocation } from 'react-router-dom'

const Header = () => {
  const location = useLocation()

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
        </div>
      </div>
    </header>
  )
}

export default Header
