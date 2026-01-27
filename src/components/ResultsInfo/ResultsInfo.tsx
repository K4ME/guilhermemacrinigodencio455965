interface ResultsInfoProps {
  searchTerm: string
  hasSearchResults: boolean
  displayedCount: number
  totalCount?: number
  entityName: string
  entityNamePlural: string
}

const ResultsInfo = ({
  searchTerm,
  hasSearchResults,
  displayedCount,
  totalCount,
  entityName,
  entityNamePlural,
}: ResultsInfoProps) => {
  if (!searchTerm.trim() && totalCount !== undefined) {
    return (
      <p className="text-sm text-gray-600 dark:text-gray-400 break-words">
        Mostrando {displayedCount} de {totalCount} {displayedCount === 1 ? entityName : entityNamePlural}
      </p>
    )
  }

  if (searchTerm.trim()) {
    return (
      <p className="text-sm text-gray-600 dark:text-gray-400 break-words">
        {hasSearchResults ? (
          <>
            Mostrando {displayedCount} resultado{displayedCount !== 1 ? 's' : ''} para &quot;{searchTerm}&quot;
            {totalCount !== undefined && totalCount > displayedCount && <> de {totalCount} total</>}
          </>
        ) : (
          <>Nenhum resultado encontrado para &quot;{searchTerm}&quot;</>
        )}
      </p>
    )
  }

  return null
}

export default ResultsInfo
