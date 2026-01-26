interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

const Pagination = ({ currentPage, totalPages, onPageChange }: PaginationProps) => {
  const handlePrevious = () => {
    if (currentPage > 0) {
      onPageChange(currentPage - 1)
    }
  }

  const handleNext = () => {
    if (currentPage < totalPages - 1) {
      onPageChange(currentPage + 1)
    }
  }

  const handlePageClick = (page: number) => {
    onPageChange(page)
  }

  const getPageNumbers = () => {
    const pages: (number | string)[] = []

    if (totalPages <= 3) {
      // Se tiver 3 ou menos páginas, mostrar todas
      for (let i = 0; i < totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Se estiver nas primeiras páginas (0 ou 1), mostrar 0 e 1
      if (currentPage <= 1) {
        pages.push(0)
        pages.push(1)
      } else {
        // Caso contrário, mostrar a página anterior e a atual
        pages.push(currentPage - 1)
        pages.push(currentPage)
      }
      
      // Se a última página não for uma das páginas já mostradas, adicionar ellipsis e última página
      const lastPage = totalPages - 1
      const pagesToShow = pages.filter((p) => typeof p === 'number') as number[]
      
      if (!pagesToShow.includes(lastPage) && lastPage > 1) {
        pages.push('ellipsis')
        pages.push(lastPage)
      }
    }

    return pages
  }

  if (totalPages <= 1) {
    return null
  }

  return (
    <div className="flex items-center justify-center gap-2 mt-8 w-full min-w-0 overflow-x-auto pb-2">
      <button
        onClick={handlePrevious}
        disabled={currentPage === 0}
        className="px-3 sm:px-4 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0 text-sm sm:text-base"
        aria-label="Página anterior"
      >
        Anterior
      </button>

      <div className="flex items-center gap-1 flex-shrink-0">
        {getPageNumbers().map((page, index) => {
          if (page === 'ellipsis') {
            return (
              <span
                key={`ellipsis-${index}`}
                className="px-1 sm:px-2 text-gray-500 dark:text-gray-400 text-sm sm:text-base"
              >
                ...
              </span>
            )
          }

          const pageNumber = page as number
          const isActive = pageNumber === currentPage

          return (
            <button
              key={pageNumber}
              onClick={() => handlePageClick(pageNumber)}
              className={`px-3 sm:px-4 py-2 rounded-lg transition-colors text-sm sm:text-base ${
                isActive
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
              aria-label={`Ir para página ${pageNumber + 1}`}
              aria-current={isActive ? 'page' : undefined}
            >
              {pageNumber + 1}
            </button>
          )
        })}
      </div>

      <button
        onClick={handleNext}
        disabled={currentPage >= totalPages - 1}
        className="px-3 sm:px-4 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0 text-sm sm:text-base"
        aria-label="Próxima página"
      >
        Próxima
      </button>
    </div>
  )
}

export default Pagination
