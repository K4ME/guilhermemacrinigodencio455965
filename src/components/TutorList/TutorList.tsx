import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { tutorService, TutorPaginatedResponse, Tutor } from '../../services/api'
import { Pagination } from '../Pagination'
import { SearchInput } from '../SearchInput'
import { handleApiError } from '../../utils/errorHandler'
import { ApiError } from '../../types/api.types'

const TutorList = () => {
  const navigate = useNavigate()
  const [page, setPage] = useState(0)
  const [size] = useState(10)
  const [data, setData] = useState<TutorPaginatedResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<ApiError | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  const fetchTutores = async (currentPage: number, searchName?: string) => {
    setLoading(true)
    setError(null)

    try {
      const response = await tutorService.getAll(currentPage, size, searchName)
      setData(response)
    } catch (err) {
      setError(err as ApiError)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTutores(page, searchTerm.trim() || undefined)
  }, [page, searchTerm])

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
    setPage(0)
  }

  const handleClearSearch = () => {
    setSearchTerm('')
    setPage(0)
  }

  const displayedTutores = data?.content || []

  const formatCpf = (cpf: number): string => {
    const cpfStr = cpf.toString().padStart(11, '0')
    return `${cpfStr.slice(0, 3)}.${cpfStr.slice(3, 6)}.${cpfStr.slice(6, 9)}-${cpfStr.slice(9)}`
  }

  const handleTutorClick = (tutorId: number) => {
    navigate(`/tutores/${tutorId}`)
  }

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Carregando tutores...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 max-w-md">
          <p className="text-red-600 dark:text-red-400 font-semibold mb-2">
            Erro ao carregar tutores
          </p>
          <p className="text-red-500 dark:text-red-300 text-sm mb-4">
            {handleApiError(error)}
          </p>
          <button
            onClick={() => fetchTutores(page, searchTerm.trim() || undefined)}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    )
  }

  const hasSearchResults = displayedTutores.length > 0
  const showNoResults = searchTerm.trim() && !hasSearchResults && !loading
  const hasNoData = !data || !data.content || data.content.length === 0

  return (
    <div className="w-full min-w-0">
      <div className="mb-6 w-full min-w-0">
        <div className="flex flex-col sm:flex-row gap-4 mb-4 w-full min-w-0">
          <div className="flex-1 min-w-0">
            <SearchInput
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Buscar por nome do tutor..."
              onClear={handleClearSearch}
            />
          </div>
          <button
            onClick={() => navigate('/tutores/new')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium whitespace-nowrap flex-shrink-0"
          >
            + Novo Tutor
          </button>
        </div>
        {!hasNoData && (
          <p className="text-sm text-gray-600 dark:text-gray-400 break-words">
            {searchTerm.trim() ? (
              <>
                {hasSearchResults ? (
                  <>
                    Mostrando {displayedTutores.length} resultado{displayedTutores.length !== 1 ? 's' : ''} para &quot;{searchTerm}&quot;
                    {data && data.total > displayedTutores.length && (
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
                    Mostrando {data.content.length} de {data.total} tutores
                  </>
                )}
              </>
            )}
          </p>
        )}
      </div>

      {hasNoData && !searchTerm.trim() ? (
        <div className="flex items-center justify-center min-h-[400px] w-full">
          <div className="text-center w-full px-4">
            <p className="text-gray-600 dark:text-gray-300 text-lg mb-2 break-words">
              Nenhum tutor encontrado
            </p>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-4 break-words">
              Não há tutores cadastrados no momento.
            </p>
            <button
              onClick={() => navigate('/tutores/new')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Cadastrar Primeiro Tutor
            </button>
          </div>
        </div>
      ) : showNoResults ? (
        <div className="flex items-center justify-center min-h-[400px] w-full">
          <div className="text-center w-full px-4">
            <p className="text-gray-600 dark:text-gray-300 text-lg mb-2 break-words">
              Nenhum tutor encontrado
            </p>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-4 break-words">
              Não há tutores com o nome &quot;{searchTerm}&quot;.
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
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden w-full min-w-0">
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {displayedTutores.map((tutor) => (
                <div
                  key={tutor.id}
                  onClick={() => handleTutorClick(tutor.id)}
                  className="flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer w-full min-w-0"
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      handleTutorClick(tutor.id)
                    }
                  }}
                  aria-label={`Ver detalhes de ${tutor.nome}`}
                >
                  {/* Foto redonda */}
                  <div className="flex-shrink-0">
                    {tutor.foto?.url ? (
                      <img
                        src={tutor.foto.url}
                        alt={tutor.nome}
                        className="w-16 h-16 rounded-full object-cover border-2 border-gray-300 dark:border-gray-600"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.style.display = 'none'
                          const parent = target.parentElement
                          if (parent) {
                            parent.innerHTML = `
                              <div class="w-16 h-16 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                                <span class="text-gray-600 dark:text-gray-400 text-xl font-semibold">
                                  ${tutor.nome.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            `
                          }
                        }}
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                        <span className="text-gray-600 dark:text-gray-400 text-xl font-semibold">
                          {tutor.nome.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Dados do tutor */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1 break-words">
                      {tutor.nome}
                    </h3>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4 gap-1 text-sm text-gray-600 dark:text-gray-300">
                      {tutor.email && (
                        <span className="break-words break-all">
                          <span className="font-medium">Email:</span> {tutor.email}
                        </span>
                      )}
                      {tutor.telefone && (
                        <span className="break-words">
                          <span className="font-medium">Telefone:</span> {tutor.telefone}
                        </span>
                      )}
                      {tutor.cpf && (
                        <span className="break-words">
                          <span className="font-medium">CPF:</span> {formatCpf(tutor.cpf)}
                        </span>
                      )}
                    </div>
                    {tutor.endereco && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 break-words">
                        {tutor.endereco}
                      </p>
                    )}
                  </div>

                  {/* Ícone de seta */}
                  <div className="flex-shrink-0">
                    <svg
                      className="w-5 h-5 text-gray-400 dark:text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {data && data.pageCount > 1 && (
            <div className="mt-6 w-full min-w-0">
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

export default TutorList
