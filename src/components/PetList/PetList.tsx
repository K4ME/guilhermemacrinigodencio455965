import { useState, useEffect } from 'react'
import { petService, PetPaginatedResponse } from '../../services/api'
import { PetCard } from '../PetCard'
import { Pagination } from '../Pagination'
import { handleApiError } from '../../utils/errorHandler'
import { ApiError } from '../../types/api.types'

const PetList = () => {
  const [page, setPage] = useState(0)
  const [size] = useState(10)
  const [data, setData] = useState<PetPaginatedResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<ApiError | null>(null)

  const fetchPets = async (currentPage: number) => {
    setLoading(true)
    setError(null)

    try {
      const response = await petService.getAll(currentPage, size)
      setData(response)
    } catch (err) {
      setError(err as ApiError)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPets(page)
  }, [page])

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

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
            onClick={() => fetchPets(page)}
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

  return (
    <>
      <div className="mb-6">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Mostrando {data.content.length} de {data.total} pets
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {data.content.map((pet) => (
          <PetCard key={pet.id} pet={pet} />
        ))}
      </div>

      <Pagination
        currentPage={data.page}
        totalPages={data.pageCount}
        onPageChange={handlePageChange}
      />
    </>
  )
}

export default PetList
