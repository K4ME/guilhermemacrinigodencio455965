import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { tutorService, CreateTutorDto, Tutor } from '../../services/api'
import { TutorForm } from '../../components/TutorForm'
import { handleApiError } from '../../utils/errorHandler'
import { ApiError } from '../../types/api.types'
import { PopConfirm } from '../../components/PopConfirm'
import { usePhotoManagement } from '../../hooks/usePhotoManagement'

const TutorFormPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [tutor, setTutor] = useState<Tutor | null>(null)
  const [loading, setLoading] = useState(false)
  const [loadingTutor, setLoadingTutor] = useState(false)
  const [error, setError] = useState<ApiError | null>(null)

  const {
    uploadingPhoto,
    deletingPhoto,
    confirmDeletePhoto,
    handlePhotoUpload,
    handlePhotoDeleteClick,
    handleConfirmDeletePhoto,
    handleCloseConfirmDeletePhoto,
  } = usePhotoManagement({
    entityId: id,
    onPhotoUpdated: (photo) => {
      if (tutor) {
        setTutor({
          ...tutor,
          foto: photo,
        })
      }
    },
    uploadPhoto: tutorService.uploadPhoto.bind(tutorService),
    deletePhoto: tutorService.deletePhoto.bind(tutorService),
    onError: (err) => setError(err),
  })

  const isEditMode = !!id

  useEffect(() => {
    if (isEditMode && id) {
      const fetchTutor = async () => {
        setLoadingTutor(true)
        setError(null)

        try {
          const tutorData = await tutorService.getById(id)
          setTutor(tutorData)
        } catch (err) {
          setError(err as ApiError)
        } finally {
          setLoadingTutor(false)
        }
      }

      fetchTutor()
    }
  }, [id, isEditMode])

  const handleSubmit = async (data: CreateTutorDto) => {
    setLoading(true)
    setError(null)

    try {
      if (isEditMode && id) {
        await tutorService.update(id, data)
      } else {
        await tutorService.create(data)
      }
      navigate('/tutores')
    } catch (err) {
      setError(err as ApiError)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    navigate(-1)
  }

  if (loadingTutor) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Carregando dados do tutor...</p>
        </div>
      </div>
    )
  }

  if (error && isEditMode) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 max-w-md">
          <p className="text-red-600 dark:text-red-400 font-semibold mb-2">
            Erro ao carregar tutor
          </p>
          <p className="text-red-500 dark:text-red-300 text-sm mb-4">
            {handleApiError(error)}
          </p>
          <button
            onClick={handleCancel}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Voltar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {isEditMode ? 'Editar Tutor' : 'Novo Tutor'}
        </h1>
        {!isEditMode && (
          <p className="text-gray-600 dark:text-gray-400">
            Preencha os dados para cadastrar um novo tutor
          </p>
        )}
      </div>

      {error && !isEditMode && (
        <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-600 dark:text-red-400 font-semibold mb-1">
            Erro ao salvar tutor
          </p>
          <p className="text-red-500 dark:text-red-300 text-sm">
            {handleApiError(error)}
          </p>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        <TutorForm
          tutor={tutor}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={loading}
          onPhotoUpload={isEditMode ? handlePhotoUpload : undefined}
          onPhotoDelete={isEditMode ? handlePhotoDeleteClick : undefined}
          isUploadingPhoto={uploadingPhoto}
          isDeletingPhoto={deletingPhoto}
        />
      </div>

      {/* PopConfirm para Remover Foto */}
      <PopConfirm
        isOpen={confirmDeletePhoto.isOpen}
        onClose={handleCloseConfirmDeletePhoto}
        onConfirm={handleConfirmDeletePhoto}
        title="Remover foto"
        message="Tem certeza que deseja remover esta foto?"
        confirmText="Remover"
        cancelText="Cancelar"
        icon={
          <svg
            className="w-6 h-6 text-red-600 dark:text-red-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        }
      />
    </div>
  )
}

export default TutorFormPage
