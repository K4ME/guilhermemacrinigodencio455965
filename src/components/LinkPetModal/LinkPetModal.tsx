import { useState, useEffect } from 'react'
import { apiFacade } from '../../services/facade'
import type { Pet, PetPaginatedResponse } from '../../services/facade'
import { SearchInput } from '../SearchInput'
import { handleApiError } from '../../utils/errorHandler'
import { ApiError } from '../../types/api.types'

interface LinkPetModalProps {
  isOpen: boolean
  onClose: () => void
  onLinkPet: (petId: string) => Promise<void>
  tutorId: string
  linkedPetIds?: number[]
}

const LinkPetModal = ({
  isOpen,
  onClose,
  onLinkPet,
  tutorId,
  linkedPetIds = [],
}: LinkPetModalProps) => {
  const [pets, setPets] = useState<Pet[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<ApiError | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(0)
  const [pagination, setPagination] = useState<PetPaginatedResponse | null>(null)
  const [linkingPetId, setLinkingPetId] = useState<string | null>(null)

  const fetchPets = async (currentPage: number, searchName?: string) => {
    setLoading(true)
    setError(null)

    try {
      const response = await apiFacade.pets.getAll(currentPage, 10, searchName)
      setPets(response.content)
      setPagination(response)
    } catch (err) {
      setError(err as ApiError)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      fetchPets(page, searchTerm.trim() || undefined)
    }
  }, [isOpen, page, searchTerm])

  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
    setPage(0)
  }

  const handleClearSearch = () => {
    setSearchTerm('')
    setPage(0)
  }

  const handleLinkPet = async (petId: string) => {
    if (linkingPetId) return

    setLinkingPetId(petId)
    try {
      await onLinkPet(petId)
      // Recarregar lista após vincular
      await fetchPets(page, searchTerm.trim() || undefined)
    } catch (err) {
      console.error('Erro ao vincular pet:', err)
    } finally {
      setLinkingPetId(null)
    }
  }

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Vincular Pet
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            aria-label="Fechar"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Search */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <SearchInput
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Buscar por nome do pet..."
            onClear={handleClearSearch}
          />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading && !pets.length ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                <p className="text-gray-600 dark:text-gray-300">Carregando pets...</p>
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-600 dark:text-red-400 font-semibold mb-2">
                Erro ao carregar pets
              </p>
              <p className="text-red-500 dark:text-red-300 text-sm">
                {handleApiError(error)}
              </p>
            </div>
          ) : pets.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-300 text-lg mb-2">
                Nenhum pet encontrado
              </p>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                {searchTerm.trim()
                  ? 'Não há pets com o nome informado.'
                  : 'Não há pets cadastrados.'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {pets.map((pet) => {
                const isLinked = linkedPetIds.includes(pet.id)
                const isLinking = linkingPetId === pet.id.toString()

                return (
                  <div
                    key={pet.id}
                    className="flex items-center gap-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    {/* Foto do Pet */}
                    <div className="flex-shrink-0">
                      {pet.foto?.url ? (
                        <img
                          src={pet.foto.url}
                          alt={pet.nome}
                          className="w-16 h-16 rounded-lg object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.style.display = 'none'
                          }}
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                          <svg
                            className="w-8 h-8 text-gray-400 dark:text-gray-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* Informações do Pet */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1 break-words">
                        {pet.nome}
                      </h3>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        <span className="break-words">Raça: {pet.raca || 'Não informado'}</span>
                        {pet.idade !== undefined && pet.idade !== null && (
                          <span className="ml-2">
                            • Idade: {pet.idade} {pet.idade === 1 ? 'ano' : 'anos'}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Botão de Vincular */}
                    <div className="flex-shrink-0">
                      {isLinked ? (
                        <span className="px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg text-sm font-medium">
                          Vinculado
                        </span>
                      ) : (
                        <button
                          onClick={() => handleLinkPet(pet.id.toString())}
                          disabled={isLinking || !!linkingPetId}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                        >
                          {isLinking ? 'Vinculando...' : 'Vincular'}
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Pagination */}
        {pagination && pagination.pageCount > 1 && (
          <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Página {pagination.page + 1} de {pagination.pageCount}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 0}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Anterior
              </button>
              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page >= pagination.pageCount - 1}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Próxima
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default LinkPetModal
