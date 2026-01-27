import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { petStore } from '../../stores'
import { useStore } from '../../hooks/useStore'
import { PetCard } from '../PetCard'
import { Pagination } from '../Pagination'
import { SearchHeader } from '../SearchHeader'
import { ResultsInfo } from '../ResultsInfo'
import { EmptyState } from '../EmptyState'
import { ErrorState } from '../ErrorState'
import { LoadingSpinner } from '../LoadingSpinner'

const PetList = () => {
  const navigate = useNavigate()
  const listState = useStore(petStore.listState$)

  useEffect(() => {
    petStore.loadPets(listState.page, 10, listState.searchTerm || undefined)
  }, [listState.page, listState.searchTerm])

  const displayedPets = listState.data?.content || []
  const hasSearchResults = displayedPets.length > 0
  const showNoResults = listState.searchTerm.trim() && !hasSearchResults && !listState.loading
  const hasNoData = !listState.data || !listState.data.content || listState.data.content.length === 0

  const handlePageChange = (newPage: number) => {
    petStore.setPage(newPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSearchChange = (value: string) => {
    petStore.setSearchTerm(value)
  }

  const handleClearSearch = () => {
    petStore.setSearchTerm('')
  }

  const refetch = () => {
    petStore.loadPets(listState.page, 10, listState.searchTerm || undefined)
  }

  if (listState.loading && !listState.data) {
    return <LoadingSpinner message="Carregando pets..." />
  }

  if (listState.error) {
    return (
      <ErrorState
        error={listState.error}
        title="Erro ao carregar pets"
        onRetry={refetch}
      />
    )
  }

  const resultsInfo = !hasNoData ? (
    <ResultsInfo
      searchTerm={listState.searchTerm}
      hasSearchResults={hasSearchResults}
      displayedCount={displayedPets.length}
      totalCount={listState.data?.total}
      entityName="pet"
      entityNamePlural="pets"
    />
  ) : undefined

  return (
    <div className="w-full min-w-0">
      <SearchHeader
        searchTerm={listState.searchTerm}
        onSearchChange={handleSearchChange}
        onClearSearch={handleClearSearch}
        onNewClick={() => navigate('/pets/new')}
        searchPlaceholder="Buscar por nome do pet..."
        newButtonLabel="+ Novo Pet"
        resultsInfo={resultsInfo}
      />

      {hasNoData && !listState.searchTerm.trim() ? (
        <EmptyState
          title="Nenhum pet encontrado"
          message="Não há pets cadastrados no momento."
          actionLabel="Cadastrar Primeiro Pet"
          onAction={() => navigate('/pets/new')}
        />
      ) : showNoResults ? (
        <EmptyState
          title="Nenhum pet encontrado"
          message={`Não há pets com o nome "${listState.searchTerm}".`}
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

          {listState.data && listState.data.pageCount > 1 && (
            <div className="w-full min-w-0 mt-6">
              <Pagination
                currentPage={listState.data.page}
                totalPages={listState.data.pageCount}
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
