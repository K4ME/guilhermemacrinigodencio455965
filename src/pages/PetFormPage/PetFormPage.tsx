import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { petStore } from '../../stores'
import { useStore } from '../../hooks/useStore'
import type { CreatePetDto } from '../../services/facade'
import { PetForm } from '../../components/PetForm'
import { handleApiError } from '../../utils/errorHandler'
import { PopConfirm } from '../../components/PopConfirm'
import { usePhotoManagement } from '../../hooks/usePhotoManagement'

const PetFormPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const formState = useStore(petStore.formState$)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [deletingPhoto, setDeletingPhoto] = useState(false)
  const [confirmDeletePhoto, setConfirmDeletePhoto] = useState<{
    isOpen: boolean
    fotoId: string | null
  }>({
    isOpen: false,
    fotoId: null,
  })

  const isEditMode = !!id

  useEffect(() => {
    if (isEditMode && id) {
      petStore.loadPetForForm(id)
    } else {
      petStore.resetFormState()
    }
  }, [id, isEditMode])

  const handlePhotoUpload = async (file: File) => {
    if (!id) return
    setUploadingPhoto(true)
    try {
      await petStore.uploadPhoto(id, file)
    } catch (error) {
      throw error
    } finally {
      setUploadingPhoto(false)
    }
  }

  const handlePhotoDeleteClick = (fotoId: string) => {
    setConfirmDeletePhoto({ isOpen: true, fotoId })
  }

  const handleConfirmDeletePhoto = async () => {
    if (!id || !confirmDeletePhoto.fotoId) return
    setDeletingPhoto(true)
    try {
      await petStore.deletePhoto(id, confirmDeletePhoto.fotoId)
      await petStore.loadPetForForm(id)
      setConfirmDeletePhoto({ isOpen: false, fotoId: null })
    } catch (error) {
      alert('Erro ao remover a foto. Tente novamente.')
    } finally {
      setDeletingPhoto(false)
    }
  }

  const handleCloseConfirmDeletePhoto = () => {
    setConfirmDeletePhoto({ isOpen: false, fotoId: null })
  }

  const handleSubmit = async (data: CreatePetDto) => {
    try {
      if (isEditMode && id) {
        await petStore.updatePet(id, data)
      } else {
        await petStore.createPet(data)
      }
      navigate('/pets')
    } catch (err) {
      // Erro já está no formState
    }
  }

  const handleCancel = () => {
    navigate(-1)
  }

  if (formState.loading && isEditMode) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Carregando dados do pet...</p>
        </div>
      </div>
    )
  }

  if (formState.error && isEditMode) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 max-w-md">
          <p className="text-red-600 dark:text-red-400 font-semibold mb-2">
            Erro ao carregar pet
          </p>
          <p className="text-red-500 dark:text-red-300 text-sm mb-4">
            {handleApiError(formState.error)}
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
    <div className="max-w-2xl mx-auto min-w-0">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 break-words">
          {isEditMode ? 'Editar Pet' : 'Novo Pet'}
        </h1>
        {!isEditMode && (
          <p className="text-gray-600 dark:text-gray-400">
            Preencha os dados para cadastrar um novo pet
          </p>
        )}
      </div>

      {formState.error && !isEditMode && (
        <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-600 dark:text-red-400 font-semibold mb-1">
            Erro ao salvar pet
          </p>
          <p className="text-red-500 dark:text-red-300 text-sm">
            {handleApiError(formState.error)}
          </p>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 min-w-0">
        <PetForm
          pet={formState.data}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={formState.loading}
          onPhotoUpload={isEditMode ? handlePhotoUpload : undefined}
          onPhotoDelete={isEditMode ? handlePhotoDeleteClick : undefined}
          isUploadingPhoto={uploadingPhoto}
          isDeletingPhoto={deletingPhoto}
        />
      </div>

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

export default PetFormPage
