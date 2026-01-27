interface EmptyStateProps {
  title: string
  message: string
  actionLabel: string
  onAction: () => void
}

const EmptyState = ({ title, message, actionLabel, onAction }: EmptyStateProps) => {
  return (
    <div className="flex items-center justify-center min-h-[400px] w-full">
      <div className="text-center w-full px-4">
        <p className="text-gray-600 dark:text-gray-300 text-lg mb-2 break-words">{title}</p>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-4 break-words">{message}</p>
        <button
          onClick={onAction}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {actionLabel}
        </button>
      </div>
    </div>
  )
}

export default EmptyState
