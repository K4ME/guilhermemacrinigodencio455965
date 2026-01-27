import { useState, useEffect, useCallback } from 'react'
import { ApiError } from '../types/api.types'

interface PaginatedResponse<T> {
  page: number
  size: number
  total: number
  pageCount: number
  content: T[]
}

interface UsePaginatedListOptions<T> {
  fetchFunction: (page: number, size: number, searchName?: string) => Promise<PaginatedResponse<T>>
  size?: number
}

interface UsePaginatedListReturn<T> {
  data: PaginatedResponse<T> | null
  loading: boolean
  error: ApiError | null
  page: number
  searchTerm: string
  displayedItems: T[]
  hasSearchResults: boolean
  showNoResults: boolean
  hasNoData: boolean
  handlePageChange: (newPage: number) => void
  handleSearchChange: (value: string) => void
  handleClearSearch: () => void
  refetch: () => void
}

export const usePaginatedList = <T>({
  fetchFunction,
  size = 10,
}: UsePaginatedListOptions<T>): UsePaginatedListReturn<T> => {
  const [page, setPage] = useState(0)
  const [data, setData] = useState<PaginatedResponse<T> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<ApiError | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  const fetchData = useCallback(
    async (currentPage: number, searchName?: string) => {
      setLoading(true)
      setError(null)

      try {
        const response = await fetchFunction(currentPage, size, searchName)
        setData(response)
      } catch (err) {
        setError(err as ApiError)
      } finally {
        setLoading(false)
      }
    },
    [fetchFunction, size]
  )

  useEffect(() => {
    fetchData(page, searchTerm.trim() || undefined)
  }, [page, searchTerm, fetchData])

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value)
    setPage(0)
  }, [])

  const handleClearSearch = useCallback(() => {
    setSearchTerm('')
    setPage(0)
  }, [])

  const refetch = useCallback(() => {
    fetchData(page, searchTerm.trim() || undefined)
  }, [fetchData, page, searchTerm])

  const displayedItems = data?.content || []
  const hasSearchResults = displayedItems.length > 0
  const showNoResults = searchTerm.trim() && !hasSearchResults && !loading
  const hasNoData = !data || !data.content || data.content.length === 0

  return {
    data,
    loading,
    error,
    page,
    searchTerm,
    displayedItems,
    hasSearchResults,
    showNoResults,
    hasNoData,
    handlePageChange,
    handleSearchChange,
    handleClearSearch,
    refetch,
  }
}
