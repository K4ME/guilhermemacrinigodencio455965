import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { petService, PetPaginatedResponse } from '../../services/api'
import { PetCard } from '../PetCard'
import { Pagination } from '../Pagination'
import { SearchInput } from '../SearchInput'
import { handleApiError } from '../../utils/errorHandler'
import { ApiError } from '../../types/api.types'

const PetList = () => {
  const navigate = useNavigate()
  const [page, setPage] = useState(0)
  const [size] = useState(10)
  const [data, setData] = useState<PetPaginatedResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<ApiError | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  const fetchPets = async (currentPage: number, searchName?: string) => {
    setLoading(true)
    setError(null)

    try {
      const response = await petService.getAll(currentPage, size, searchName)
      setData(response)
    } catch (err) {
      setError(err as ApiError)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPets(page, searchTerm.trim() || undefined)
  }, [page, searchTerm])

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
    // Resetar para primeira página quando buscar
    setPage(0)
  }

  const handleClearSearch = () => {
    setSearchTerm('')
    setPage(0)
  }

  // Usar os pets diretamente da resposta da API (busca server-side)
  const displayedPets = data?.content || []

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Carregando pets...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 max-w-md">
          <p className="text-red-600 dark:text-red-400 font-semibold mb-2">
            Erro ao carregar pets
          </p>
          <p className="text-red-500 dark:text-red-300 text-sm mb-4">
            {handleApiError(error)}
          </p>
          <button
            onClick={() => fetchPets(page, searchTerm.trim() || undefined)}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    )
  }

  if (!data || !data.content || data.content.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-300 text-lg mb-2">
            Nenhum pet encontrado
          </p>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Não há pets cadastrados no momento.
          </p>
        </div>
      </div>
    )
  }

  const hasSearchResults = displayedPets.length > 0
  const showNoResults = searchTerm.trim() && !hasSearchResults && !loading

  return (
    <div className="w-full min-w-0">
      <div className="mb-6 w-full min-w-0">
        <div className="flex flex-col sm:flex-row gap-4 mb-4 w-full min-w-0">
          <div className="flex-1 min-w-0">
            <SearchInput
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Buscar por nome do pet..."
              onClear={handleClearSearch}
            />
          </div>
          <button
            onClick={() => navigate('/pets/new')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium whitespace-nowrap flex-shrink-0"
          >
            + Novo Pet
          </button>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 break-words">
          {searchTerm.trim() ? (
            <>
              {hasSearchResults ? (
                <>
                  Mostrando {displayedPets.length} resultado{displayedPets.length !== 1 ? 's' : ''} para &quot;{searchTerm}&quot;
                  {data && data.total > displayedPets.length && (
                    <> de {data.total} total</>
                  )}
                </>
              ) : (
                <>
                  Nenhum resultado encontrado para &quot;{searchTerm}&quot;
                </>
              )}
            </>
          ) : (
            <>
              {data && (
                <>
                  Mostrando {data.content.length} de {data.total} pets
                </>
              )}
            </>
          )}
        </p>
      </div>

      {showNoResults ? (
        <div className="flex items-center justify-center min-h-[400px] w-full">
          <div className="text-center w-full px-4">
            <p className="text-gray-600 dark:text-gray-300 text-lg mb-2 break-words">
              Nenhum pet encontrado
            </p>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-4 break-words">
              Não há pets com o nome &quot;{searchTerm}&quot;.
            </p>
            <button
              onClick={handleClearSearch}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Limpar busca
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 w-full min-w-0">
            {displayedPets.map((pet) => (
              <PetCard key={pet.id} pet={pet} />
            ))}
          </div>

          {data && data.pageCount > 1 && (
            <div className="w-full min-w-0 mt-6">
              <Pagination
                currentPage={data.page}
                totalPages={data.pageCount}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default PetList
