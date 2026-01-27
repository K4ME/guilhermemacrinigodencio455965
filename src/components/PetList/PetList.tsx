import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { petService } from '../../services/api'
import { PetCard } from '../PetCard'
import { Pagination } from '../Pagination'
import { SearchHeader } from '../SearchHeader'
import { ResultsInfo } from '../ResultsInfo'
import { EmptyState } from '../EmptyState'
import { ErrorState } from '../ErrorState'
import { LoadingSpinner } from '../LoadingSpinner'
import { usePaginatedList } from '../../hooks'

const PetList = () => {
  const navigate = useNavigate()

  const fetchPets = useMemo(
    () => (page: number, size: number, searchName?: string) =>
      petService.getAll(page, size, searchName),
    []
  )

  const {
    data,
    loading,
    error,
    searchTerm,
    displayedItems: displayedPets,
    hasSearchResults,
    showNoResults,
    hasNoData,
    handlePageChange,
    handleSearchChange,
    handleClearSearch,
    refetch,
  } = usePaginatedList({
    fetchFunction: fetchPets,
    size: 10,
  })

  if (loading && !data) {
    return <LoadingSpinner message="Carregando pets..." />
  }

  if (error) {
    return (
      <ErrorState
        error={error}
        title="Erro ao carregar pets"
        onRetry={refetch}
      />
    )
  }

  const resultsInfo = !hasNoData ? (
    <ResultsInfo
      searchTerm={searchTerm}
      hasSearchResults={hasSearchResults}
      displayedCount={displayedPets.length}
      totalCount={data?.total}
      entityName="pet"
      entityNamePlural="pets"
    />
  ) : undefined

  return (
    <div className="w-full min-w-0">
      <SearchHeader
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        onClearSearch={handleClearSearch}
        onNewClick={() => navigate('/pets/new')}
        searchPlaceholder="Buscar por nome do pet..."
        newButtonLabel="+ Novo Pet"
        resultsInfo={resultsInfo}
      />

      {hasNoData && !searchTerm.trim() ? (
        <EmptyState
          title="Nenhum pet encontrado"
          message="Não há pets cadastrados no momento."
          actionLabel="Cadastrar Primeiro Pet"
          onAction={() => navigate('/pets/new')}
        />
      ) : showNoResults ? (
        <EmptyState
          title="Nenhum pet encontrado"
          message={`Não há pets com o nome "${searchTerm}".`}
          actionLabel="Limpar busca"
          onAction={handleClearSearch}
        />
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
