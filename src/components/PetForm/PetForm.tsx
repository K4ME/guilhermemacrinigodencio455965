import { useState, useEffect, useRef } from 'react'
import { CreatePetDto, Pet } from '../../services/api'

interface PetFormProps {
  pet?: Pet | null
  onSubmit: (data: CreatePetDto) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
  onPhotoUpload?: (file: File) => Promise<void>
  onPhotoDelete?: (fotoId: string) => Promise<void>
  isUploadingPhoto?: boolean
  isDeletingPhoto?: boolean
}

const PetForm = ({
  pet,
  onSubmit,
  onCancel,
  isLoading = false,
  onPhotoUpload,
  onPhotoDelete,
  isUploadingPhoto = false,
  isDeletingPhoto = false,
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
  const nomeTextareaRef = useRef<HTMLTextAreaElement>(null)
  const racaTextareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (pet) {
      setFormData({
        nome: pet.nome || '',
        raca: pet.raca || '',
        idade: pet.idade || 0,
      })
      if (pet.foto?.url) {
        setPhotoPreview(pet.foto.url)
      } else {
        setPhotoPreview(null)
      }
    }
  }, [pet])

  const adjustTextareaHeight = (textarea: HTMLTextAreaElement | null) => {
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = `${textarea.scrollHeight}px`
    }
  }

  useEffect(() => {
    adjustTextareaHeight(nomeTextareaRef.current)
    adjustTextareaHeight(racaTextareaRef.current)
  }, [formData.nome, formData.raca])

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
      {/* Layout: Foto à esquerda, Campos à direita - apenas no modo de edição */}
      {pet && onPhotoUpload ? (
        <div className="flex flex-col md:flex-row gap-8 items-start">
          {/* Foto à esquerda */}
          <div className="flex-shrink-0 md:self-stretch">
            <input
              type="file"
              id="foto"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              disabled={isLoading || isUploadingPhoto}
            />
            <div className="flex flex-col items-center gap-4 h-full md:justify-start">
              <label
                htmlFor="foto"
                className="relative cursor-pointer group disabled:opacity-50 disabled:cursor-not-allowed h-full flex items-center"
              >
                {photoPreview ? (
                  <div className="relative h-full">
                    <img
                      src={photoPreview}
                      alt="Preview"
                      className="w-48 h-full min-h-[280px] object-contain rounded-lg border-2 border-gray-300 dark:border-gray-600 group-hover:border-blue-500 transition-colors"
                      onError={() => {
                        setPhotoError('Não foi possível carregar a imagem')
                      }}
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-lg transition-all flex flex-col items-center justify-center gap-2">
                      <span className="text-white opacity-0 group-hover:opacity-100 font-medium text-sm">
                        Clique para trocar
                      </span>
                      <span className="text-white opacity-0 group-hover:opacity-100 text-xs">
                        JPG, PNG, GIF. Máx: 5MB
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="w-48 h-full min-h-[280px] bg-gray-200 dark:bg-gray-700 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 group-hover:border-blue-500 transition-colors flex items-center justify-center">
                    <div className="text-center">
                      <svg
                        className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Clique para selecionar
                      </p>
                    </div>
                  </div>
                )}
              </label>
              {selectedFile && (
                <div className="flex flex-col items-center gap-2 w-full min-w-0">
                  <p className="text-sm text-gray-600 dark:text-gray-400 text-center break-words max-w-full">
                    {selectedFile.name}
                  </p>
                  <button
                    type="button"
                    onClick={handlePhotoUpload}
                    disabled={isLoading || isUploadingPhoto || !!photoError}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isUploadingPhoto ? 'Enviando...' : 'Enviar Foto'}
                  </button>
                </div>
              )}
              {pet?.foto && !selectedFile && onPhotoDelete && (
                <button
                  type="button"
                  onClick={() => onPhotoDelete(pet.foto!.id.toString())}
                  disabled={isLoading || isDeletingPhoto}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  {isDeletingPhoto ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Removendo...</span>
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                      <span>Remover Foto</span>
                    </>
                  )}
                </button>
              )}
              {photoError && (
                <p className="text-sm text-red-600 dark:text-red-400 text-center">{photoError}</p>
              )}
            </div>
          </div>

          {/* Campos à direita */}
          <div className="flex-1 space-y-6 w-full md:self-stretch min-w-0">
            <div>
              <label
                htmlFor="nome"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Nome <span className="text-red-500">*</span>
              </label>
              <textarea
                ref={nomeTextareaRef}
                id="nome"
                value={formData.nome}
                onChange={(e) => {
                  handleChange('nome', e.target.value)
                  adjustTextareaHeight(e.target)
                }}
                rows={1}
                className={`w-full min-w-0 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none overflow-hidden ${
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
              <textarea
                ref={racaTextareaRef}
                id="raca"
                value={formData.raca}
                onChange={(e) => {
                  handleChange('raca', e.target.value)
                  adjustTextareaHeight(e.target)
                }}
                rows={1}
                className={`w-full min-w-0 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none overflow-hidden ${
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
          </div>
        </div>
      ) : (
        /* Campos normais quando não está em modo de edição */
        <>
          <div>
            <label
              htmlFor="nome"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Nome <span className="text-red-500">*</span>
            </label>
            <textarea
              ref={nomeTextareaRef}
              id="nome"
              value={formData.nome}
              onChange={(e) => {
                handleChange('nome', e.target.value)
                adjustTextareaHeight(e.target)
              }}
              rows={1}
              className={`w-full min-w-0 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none overflow-hidden ${
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
            <textarea
              ref={racaTextareaRef}
              id="raca"
              value={formData.raca}
              onChange={(e) => {
                handleChange('raca', e.target.value)
                adjustTextareaHeight(e.target)
              }}
              rows={1}
              className={`w-full min-w-0 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none overflow-hidden ${
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
        </>
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
