import { useState, useCallback, useRef, useEffect } from 'react'
import { PetPhoto } from '../services/api'
import { ApiError } from '../types/api.types'

interface UsePhotoManagementOptions<T> {
  entityId: string | undefined
  onPhotoUpdated: (photo: PetPhoto | null) => void
  uploadPhoto: (id: string, file: File) => Promise<PetPhoto>
  deletePhoto: (id: string, fotoId: string) => Promise<void>
  onError?: (error: ApiError) => void
}

interface UsePhotoManagementReturn {
  uploadingPhoto: boolean
  deletingPhoto: boolean
  confirmDeletePhoto: {
    isOpen: boolean
    fotoId: string | null
  }
  handlePhotoUpload: (file: File) => Promise<void>
  handlePhotoDeleteClick: (fotoId: string) => void
  handleConfirmDeletePhoto: () => Promise<void>
  handleCloseConfirmDeletePhoto: () => void
}

export const usePhotoManagement = <T>({
  entityId,
  onPhotoUpdated,
  uploadPhoto,
  deletePhoto,
  onError,
}: UsePhotoManagementOptions<T>): UsePhotoManagementReturn => {
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [deletingPhoto, setDeletingPhoto] = useState(false)
  const [confirmDeletePhoto, setConfirmDeletePhoto] = useState<{
    isOpen: boolean
    fotoId: string | null
  }>({
    isOpen: false,
    fotoId: null,
  })

  // Usar ref para garantir que sempre temos a versão mais recente do callback
  const onPhotoUpdatedRef = useRef(onPhotoUpdated)
  const onErrorRef = useRef(onError)

  useEffect(() => {
    onPhotoUpdatedRef.current = onPhotoUpdated
    onErrorRef.current = onError
  }, [onPhotoUpdated, onError])

  const handlePhotoUpload = useCallback(
    async (file: File) => {
      if (!entityId) return

      setUploadingPhoto(true)

      try {
        const photo = await uploadPhoto(entityId, file)
        onPhotoUpdatedRef.current(photo)
      } catch (err) {
        const error = err as ApiError
        if (onErrorRef.current) {
          onErrorRef.current(error)
        }
        throw err
      } finally {
        setUploadingPhoto(false)
      }
    },
    [entityId, uploadPhoto]
  )

  const handlePhotoDeleteClick = useCallback((fotoId: string) => {
    setConfirmDeletePhoto({
      isOpen: true,
      fotoId,
    })
  }, [])

  const handleConfirmDeletePhoto = useCallback(async () => {
    if (!entityId || !confirmDeletePhoto.fotoId) return

    setDeletingPhoto(true)

    try {
      await deletePhoto(entityId, confirmDeletePhoto.fotoId)
      onPhotoUpdatedRef.current(null)
    } catch (err) {
      const error = err as ApiError
      if (onErrorRef.current) {
        onErrorRef.current(error)
      }
      alert('Erro ao remover a foto. Tente novamente.')
    } finally {
      setDeletingPhoto(false)
      setConfirmDeletePhoto({
        isOpen: false,
        fotoId: null,
      })
    }
  }, [entityId, confirmDeletePhoto.fotoId, deletePhoto])

  const handleCloseConfirmDeletePhoto = useCallback(() => {
    setConfirmDeletePhoto({
      isOpen: false,
      fotoId: null,
    })
  }, [])

  return {
    uploadingPhoto,
    deletingPhoto,
    confirmDeletePhoto,
    handlePhotoUpload,
    handlePhotoDeleteClick,
    handleConfirmDeletePhoto,
    handleCloseConfirmDeletePhoto,
  }
}
