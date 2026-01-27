import { ApiError } from '../../types/api.types'
import { handleApiError } from '../../utils/errorHandler'

interface ErrorStateProps {
  error: ApiError
  title: string
  onRetry: () => void
}

const ErrorState = ({ error, title, onRetry }: ErrorStateProps) => {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 max-w-md">
        <p className="text-red-600 dark:text-red-400 font-semibold mb-2">{title}</p>
        <p className="text-red-500 dark:text-red-300 text-sm mb-4">{handleApiError(error)}</p>
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Tentar novamente
        </button>
      </div>
    </div>
  )
}

export default ErrorState
