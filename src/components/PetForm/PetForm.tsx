import { useState, useEffect } from 'react'
import { CreatePetDto, Pet } from '../../services/api'

interface PetFormProps {
  pet?: Pet | null
  onSubmit: (data: CreatePetDto) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
  onPhotoUpload?: (file: File) => Promise<void>
  isUploadingPhoto?: boolean
}

const PetForm = ({
  pet,
  onSubmit,
  onCancel,
  isLoading = false,
  onPhotoUpload,
  isUploadingPhoto = false,
}: PetFormProps) => {
  const [formData, setFormData] = useState<CreatePetDto>({
    nome: '',
    raca: '',
    idade: 0,
  })
  const [errors, setErrors] = useState<Partial<Record<keyof CreatePetDto, string>>>({})
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [photoError, setPhotoError] = useState<string>('')

  useEffect(() => {
    if (pet) {
      setFormData({
        nome: pet.nome || '',
        raca: pet.raca || '',
        idade: pet.idade || 0,
      })
      if (pet.foto?.url) {
        setPhotoPreview(pet.foto.url)
      }
    }
  }, [pet])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validar tipo de arquivo
      if (!file.type.startsWith('image/')) {
        setPhotoError('Por favor, selecione apenas arquivos de imagem')
        return
      }

      // Validar tamanho (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setPhotoError('O arquivo deve ter no máximo 5MB')
        return
      }

      setSelectedFile(file)
      setPhotoError('')

      // Criar preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handlePhotoUpload = async () => {
    if (!selectedFile || !onPhotoUpload) {
      return
    }

    try {
      await onPhotoUpload(selectedFile)
      setSelectedFile(null)
      setPhotoError('')
    } catch (error) {
      console.error('Erro ao fazer upload da foto:', error)
      setPhotoError('Erro ao enviar o arquivo da foto')
    }
  }

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof CreatePetDto, string>> = {}

    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome é obrigatório'
    }

    if (!formData.raca.trim()) {
      newErrors.raca = 'Raça é obrigatória'
    }

    if (formData.idade < 0) {
      newErrors.idade = 'Idade deve ser maior ou igual a zero'
    }

    if (formData.idade > 50) {
      newErrors.idade = 'Idade deve ser menor ou igual a 50'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (field: keyof CreatePetDto, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
    // Limpar erro do campo ao editar
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) {
      return
    }

    try {
      await onSubmit(formData)
    } catch (error) {
      console.error('Erro ao salvar pet:', error)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label
          htmlFor="nome"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          Nome <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="nome"
          value={formData.nome}
          onChange={(e) => handleChange('nome', e.target.value)}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
            errors.nome
              ? 'border-red-500 dark:border-red-500'
              : 'border-gray-300 dark:border-gray-600'
          } bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
          placeholder="Digite o nome do pet"
          disabled={isLoading}
        />
        {errors.nome && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.nome}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="raca"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          Raça <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="raca"
          value={formData.raca}
          onChange={(e) => handleChange('raca', e.target.value)}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
            errors.raca
              ? 'border-red-500 dark:border-red-500'
              : 'border-gray-300 dark:border-gray-600'
          } bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
          placeholder="Digite a raça do pet"
          disabled={isLoading}
        />
        {errors.raca && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.raca}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="idade"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          Idade <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          id="idade"
          min="0"
          max="50"
          value={formData.idade}
          onChange={(e) => handleChange('idade', parseInt(e.target.value) || 0)}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
            errors.idade
              ? 'border-red-500 dark:border-red-500'
              : 'border-gray-300 dark:border-gray-600'
          } bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
          placeholder="Digite a idade do pet"
          disabled={isLoading}
        />
        {errors.idade && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.idade}</p>
        )}
      </div>

      {/* Upload de Foto - apenas no modo de edição */}
      {pet && onPhotoUpload && (
        <div>
          <label
            htmlFor="foto"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Foto
          </label>
          {photoPreview && (
            <div className="mb-4">
              <img
                src={photoPreview}
                alt="Preview"
                className="w-32 h-32 object-cover rounded-lg border border-gray-300 dark:border-gray-600"
                onError={() => {
                  setPhotoError('Não foi possível carregar a imagem')
                }}
              />
            </div>
          )}
          <div className="flex gap-2">
            <input
              type="file"
              id="foto"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              disabled={isLoading || isUploadingPhoto}
            />
            <label
              htmlFor="foto"
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer transition-colors text-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {selectedFile ? selectedFile.name : 'Selecionar foto'}
            </label>
            {selectedFile && (
              <button
                type="button"
                onClick={handlePhotoUpload}
                disabled={isLoading || isUploadingPhoto || !!photoError}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isUploadingPhoto ? 'Enviando...' : 'Enviar Foto'}
              </button>
            )}
          </div>
          {photoError && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{photoError}</p>
          )}
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Formatos aceitos: JPG, PNG, GIF. Tamanho máximo: 5MB
          </p>
        </div>
      )}

      <div className="flex gap-4 pt-4">
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
        >
          {isLoading ? 'Salvando...' : pet ? 'Atualizar' : 'Cadastrar'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
        >
          Cancelar
        </button>
      </div>
    </form>
  )
}

export default PetForm
