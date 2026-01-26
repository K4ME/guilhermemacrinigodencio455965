import { useState, useEffect } from 'react'
import { CreateTutorDto, Tutor } from '../../services/api'

interface TutorFormProps {
  tutor?: Tutor | null
  onSubmit: (data: CreateTutorDto) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
  onPhotoUpload?: (file: File) => Promise<void>
  isUploadingPhoto?: boolean
}

const TutorForm = ({
  tutor,
  onSubmit,
  onCancel,
  isLoading = false,
  onPhotoUpload,
  isUploadingPhoto = false,
}: TutorFormProps) => {
  const [formData, setFormData] = useState<CreateTutorDto>({
    nome: '',
    email: '',
    telefone: '',
    endereco: '',
    cpf: 0,
  })
  const [errors, setErrors] = useState<Partial<Record<keyof CreateTutorDto, string>>>({})
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [photoError, setPhotoError] = useState<string>('')

  useEffect(() => {
    if (tutor) {
      setFormData({
        nome: tutor.nome || '',
        email: tutor.email || '',
        telefone: tutor.telefone || '',
        endereco: tutor.endereco || '',
        cpf: tutor.cpf || 0,
      })
      if (tutor.foto?.url) {
        setPhotoPreview(tutor.foto.url)
      }
    }
  }, [tutor])

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
    const newErrors: Partial<Record<keyof CreateTutorDto, string>> = {}

    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome completo é obrigatório'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido'
    }

    if (!formData.telefone.trim()) {
      newErrors.telefone = 'Telefone é obrigatório'
    }

    if (!formData.endereco.trim()) {
      newErrors.endereco = 'Endereço é obrigatório'
    }

    if (!formData.cpf || formData.cpf.toString().length !== 11) {
      newErrors.cpf = 'CPF deve ter 11 dígitos'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (field: keyof CreateTutorDto, value: string | number) => {
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

  const handleCpfChange = (value: string) => {
    // Remove caracteres não numéricos
    const numericValue = value.replace(/\D/g, '')
    if (numericValue.length <= 11) {
      handleChange('cpf', numericValue ? parseInt(numericValue, 10) : 0)
    }
  }

  const handleTelefoneChange = (value: string) => {
    // Remove caracteres não numéricos
    const numericValue = value.replace(/\D/g, '')
    // Formata telefone: (XX) XXXXX-XXXX
    let formatted = numericValue
    if (numericValue.length > 10) {
      formatted = `(${numericValue.slice(0, 2)}) ${numericValue.slice(2, 7)}-${numericValue.slice(7, 11)}`
    } else if (numericValue.length > 6) {
      formatted = `(${numericValue.slice(0, 2)}) ${numericValue.slice(2, 6)}-${numericValue.slice(6)}`
    } else if (numericValue.length > 2) {
      formatted = `(${numericValue.slice(0, 2)}) ${numericValue.slice(2)}`
    } else if (numericValue.length > 0) {
      formatted = `(${numericValue}`
    }
    handleChange('telefone', formatted)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) {
      return
    }

    try {
      await onSubmit(formData)
    } catch (error) {
      console.error('Erro ao salvar tutor:', error)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Upload de foto - apenas no modo de edição, na primeira linha */}
      {tutor && onPhotoUpload && (
        <div className="mb-6">
          <div className="flex flex-col items-start gap-4">
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
              className="relative cursor-pointer group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {photoPreview ? (
                <div className="relative">
                  <img
                    src={photoPreview}
                    alt="Preview"
                    className="w-48 h-48 object-contain rounded-lg border-2 border-gray-300 dark:border-gray-600 group-hover:border-blue-500 transition-colors"
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
                <div className="w-48 h-48 bg-gray-200 dark:bg-gray-700 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 group-hover:border-blue-500 transition-colors flex items-center justify-center">
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
              <div className="flex flex-col items-start gap-2 w-full min-w-0">
                <p className="text-sm text-gray-600 dark:text-gray-400 break-words max-w-full">
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
            {photoError && (
              <p className="text-sm text-red-600 dark:text-red-400">{photoError}</p>
            )}
          </div>
        </div>
      )}

      <div>
        <label
          htmlFor="nome"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          Nome Completo <span className="text-red-500">*</span>
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
          placeholder="Digite o nome completo do tutor"
          disabled={isLoading}
        />
        {errors.nome && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.nome}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          Email <span className="text-red-500">*</span>
        </label>
        <input
          type="email"
          id="email"
          value={formData.email}
          onChange={(e) => handleChange('email', e.target.value)}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
            errors.email
              ? 'border-red-500 dark:border-red-500'
              : 'border-gray-300 dark:border-gray-600'
          } bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
          placeholder="Digite o email do tutor"
          disabled={isLoading}
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="telefone"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          Telefone <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="telefone"
          value={formData.telefone}
          onChange={(e) => handleTelefoneChange(e.target.value)}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
            errors.telefone
              ? 'border-red-500 dark:border-red-500'
              : 'border-gray-300 dark:border-gray-600'
          } bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
          placeholder="(11) 91234-5678"
          disabled={isLoading}
          maxLength={15}
        />
        {errors.telefone && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.telefone}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="endereco"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          Endereço <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="endereco"
          value={formData.endereco}
          onChange={(e) => handleChange('endereco', e.target.value)}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
            errors.endereco
              ? 'border-red-500 dark:border-red-500'
              : 'border-gray-300 dark:border-gray-600'
          } bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
          placeholder="Rua das Flores, 123, Bairro Centro, São Paulo - SP"
          disabled={isLoading}
        />
        {errors.endereco && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.endereco}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="cpf"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          CPF <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="cpf"
          value={formData.cpf || ''}
          onChange={(e) => handleCpfChange(e.target.value)}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
            errors.cpf
              ? 'border-red-500 dark:border-red-500'
              : 'border-gray-300 dark:border-gray-600'
          } bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
          placeholder="12345678901"
          disabled={isLoading}
          maxLength={11}
        />
        {errors.cpf && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.cpf}</p>
        )}
      </div>

      <div className="flex gap-4 pt-4">
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
        >
          {isLoading ? 'Salvando...' : tutor ? 'Atualizar' : 'Cadastrar'}
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

export default TutorForm
