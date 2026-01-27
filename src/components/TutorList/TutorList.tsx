import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiFacade } from '../../services/facade'
import type { Tutor } from '../../services/facade'
import { Pagination } from '../Pagination'
import { SearchHeader } from '../SearchHeader'
import { ResultsInfo } from '../ResultsInfo'
import { EmptyState } from '../EmptyState'
import { ErrorState } from '../ErrorState'
import { LoadingSpinner } from '../LoadingSpinner'
import { usePaginatedList } from '../../hooks'

const TutorList = () => {
  const navigate = useNavigate()

  const fetchTutores = useMemo(
    () => (page: number, size: number, searchName?: string) =>
      apiFacade.tutors.getAll(page, size, searchName),
    []
  )

  const {
    data,
    loading,
    error,
    searchTerm,
    displayedItems: displayedTutores,
    hasSearchResults,
    showNoResults,
    hasNoData,
    handlePageChange,
    handleSearchChange,
    handleClearSearch,
    refetch,
  } = usePaginatedList({
    fetchFunction: fetchTutores,
    size: 10,
  })

  const formatCpf = (cpf: number): string => {
    const cpfStr = cpf.toString().padStart(11, '0')
    return `${cpfStr.slice(0, 3)}.${cpfStr.slice(3, 6)}.${cpfStr.slice(6, 9)}-${cpfStr.slice(9)}`
  }

  const handleTutorClick = (tutorId: number) => {
    navigate(`/tutores/${tutorId}`)
  }

  if (loading && !data) {
    return <LoadingSpinner message="Carregando tutores..." />
  }

  if (error) {
    return (
      <ErrorState
        error={error}
        title="Erro ao carregar tutores"
        onRetry={refetch}
      />
    )
  }

  const resultsInfo = !hasNoData ? (
    <ResultsInfo
      searchTerm={searchTerm}
      hasSearchResults={hasSearchResults}
      displayedCount={displayedTutores.length}
      totalCount={data?.total}
      entityName="tutor"
      entityNamePlural="tutores"
    />
  ) : undefined

  return (
    <div className="w-full min-w-0">
      <SearchHeader
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        onClearSearch={handleClearSearch}
        onNewClick={() => navigate('/tutores/new')}
        searchPlaceholder="Buscar por nome do tutor..."
        newButtonLabel="+ Novo Tutor"
        resultsInfo={resultsInfo}
      />

      {hasNoData && !searchTerm.trim() ? (
        <EmptyState
          title="Nenhum tutor encontrado"
          message="Não há tutores cadastrados no momento."
          actionLabel="Cadastrar Primeiro Tutor"
          onAction={() => navigate('/tutores/new')}
        />
      ) : showNoResults ? (
        <EmptyState
          title="Nenhum tutor encontrado"
          message={`Não há tutores com o nome "${searchTerm}".`}
          actionLabel="Limpar busca"
          onAction={handleClearSearch}
        />
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
