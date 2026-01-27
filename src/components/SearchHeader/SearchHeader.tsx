import { SearchInput } from '../SearchInput'

interface SearchHeaderProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  onClearSearch: () => void
  onNewClick: () => void
  searchPlaceholder: string
  newButtonLabel: string
  resultsInfo?: React.ReactNode
}

const SearchHeader = ({
  searchTerm,
  onSearchChange,
  onClearSearch,
  onNewClick,
  searchPlaceholder,
  newButtonLabel,
  resultsInfo,
}: SearchHeaderProps) => {
  return (
    <div className="mb-6 w-full min-w-0">
      <div className="flex flex-col sm:flex-row gap-4 mb-4 w-full min-w-0">
        <div className="flex-1 min-w-0">
          <SearchInput
            value={searchTerm}
            onChange={onSearchChange}
            placeholder={searchPlaceholder}
            onClear={onClearSearch}
          />
        </div>
        <button
          onClick={onNewClick}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium whitespace-nowrap flex-shrink-0"
        >
          {newButtonLabel}
        </button>
      </div>
      {resultsInfo}
    </div>
  )
}

export default SearchHeader
