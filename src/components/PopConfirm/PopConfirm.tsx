import { ReactNode } from 'react'

interface PopConfirmProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title?: string
  message: string
  confirmText?: string
  cancelText?: string
  confirmButtonClassName?: string
  cancelButtonClassName?: string
  icon?: ReactNode
}

const PopConfirm = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirmar ação',
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  confirmButtonClassName = '',
  cancelButtonClassName = '',
  icon,
}: PopConfirmProps) => {
  if (!isOpen) return null

  const handleConfirm = () => {
    onConfirm()
    onClose()
  }

  const handleCancel = () => {
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            {icon && <div className="flex-shrink-0">{icon}</div>}
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              {title}
            </h3>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-600 dark:text-gray-300 break-words">
            {message}
          </p>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex gap-3 justify-end">
          <button
            onClick={handleCancel}
            className={`px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium ${cancelButtonClassName}`}
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            className={`px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium ${confirmButtonClassName}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}

export default PopConfirm
