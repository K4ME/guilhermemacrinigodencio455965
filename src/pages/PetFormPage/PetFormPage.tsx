import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { petService, CreatePetDto, Pet } from '../../services/api'
import { PetForm } from '../../components/PetForm'
import { handleApiError } from '../../utils/errorHandler'
import { ApiError } from '../../types/api.types'

const PetFormPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [pet, setPet] = useState<Pet | null>(null)
  const [loading, setLoading] = useState(false)
  const [loadingPet, setLoadingPet] = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [error, setError] = useState<ApiError | null>(null)

  const isEditMode = !!id

  useEffect(() => {
    if (isEditMode && id) {
      const fetchPet = async () => {
        setLoadingPet(true)
        setError(null)

        try {
          const petData = await petService.getById(id)
          setPet(petData)
        } catch (err) {
          setError(err as ApiError)
        } finally {
          setLoadingPet(false)
        }
      }

      fetchPet()
    }
  }, [id, isEditMode])

  const handleSubmit = async (data: CreatePetDto) => {
    setLoading(true)
    setError(null)

    try {
      if (isEditMode && id) {
        await petService.update(id, data)
      } else {
        await petService.create(data)
      }
      navigate('/pets')
    } catch (err) {
      setError(err as ApiError)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    navigate(-1)
  }

  const handlePhotoUpload = async (file: File) => {
    if (!id) return

    setUploadingPhoto(true)
    setError(null)

    try {
      const photo = await petService.uploadPhoto(id, file)
      // Atualizar o pet com a nova foto
      if (pet) {
        setPet({
          ...pet,
          foto: photo,
        })
      }
    } catch (err) {
      setError(err as ApiError)
      throw err
    } finally {
      setUploadingPhoto(false)
    }
  }

  if (loadingPet) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Carregando dados do pet...</p>
        </div>
      </div>
    )
  }

  if (error && isEditMode) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 max-w-md">
          <p className="text-red-600 dark:text-red-400 font-semibold mb-2">
            Erro ao carregar pet
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
          {isEditMode ? 'Editar Pet' : 'Novo Pet'}
        </h1>
        {!isEditMode && (
          <p className="text-gray-600 dark:text-gray-400">
            Preencha os dados para cadastrar um novo pet
          </p>
        )}
      </div>

      {error && !isEditMode && (
        <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-600 dark:text-red-400 font-semibold mb-1">
            Erro ao salvar pet
          </p>
          <p className="text-red-500 dark:text-red-300 text-sm">
            {handleApiError(error)}
          </p>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        <PetForm
          pet={pet}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={loading}
          onPhotoUpload={isEditMode ? handlePhotoUpload : undefined}
          isUploadingPhoto={uploadingPhoto}
        />
      </div>
    </div>
  )
}

export default PetFormPage
