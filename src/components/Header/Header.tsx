import { Link, useLocation } from 'react-router-dom'

const Header = () => {
  const location = useLocation()

  return (
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
  )
}

export default Header
