interface LoadingSpinnerProps {
  message?: string
  fullScreen?: boolean
}

const LoadingSpinner = ({ message = 'Carregando...', fullScreen = false }: LoadingSpinnerProps) => {
  const containerClasses = fullScreen
    ? 'min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center'
    : 'flex items-center justify-center min-h-[400px]'

  return (
    <div className={containerClasses}>
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-600 dark:text-gray-300">{message}</p>
      </div>
    </div>
  )
}

export default LoadingSpinner
