import { useState, useCallback } from 'react'
import { ApiError } from '../types/api.types'

interface UseMutationState<T> {
  data: T | null
  loading: boolean
  error: ApiError | null
}

export const useMutation = <TData = unknown, TVariables = unknown>(
  mutationFn: (variables: TVariables) => Promise<TData>
) => {
  const [state, setState] = useState<UseMutationState<TData>>({
    data: null,
    loading: false,
    error: null,
  })

  const mutate = useCallback(
    async (variables: TVariables) => {
      setState((prev) => ({ ...prev, loading: true, error: null }))

      try {
        const data = await mutationFn(variables)
        setState({ data, loading: false, error: null })
        return data
      } catch (error) {
        const apiError = error as ApiError
        setState((prev) => ({ ...prev, loading: false, error: apiError }))
        throw apiError
      }
    },
    [mutationFn]
  )

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null })
  }, [])

  return {
    ...state,
    mutate,
    reset,
  }
}
