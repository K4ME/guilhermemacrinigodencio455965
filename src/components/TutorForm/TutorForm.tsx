import { useState, useEffect } from 'react'
import { CreateTutorDto, Tutor } from '../../services/api'

interface TutorFormProps {
  tutor?: Tutor | null
  onSubmit: (data: CreateTutorDto) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

const TutorForm = ({ tutor, onSubmit, onCancel, isLoading = false }: TutorFormProps) => {
  const [formData, setFormData] = useState<CreateTutorDto>({
    nome: '',
    email: '',
    telefone: '',
    endereco: '',
    cpf: 0,
  })
  const [errors, setErrors] = useState<Partial<Record<keyof CreateTutorDto, string>>>({})

  useEffect(() => {
    if (tutor) {
      setFormData({
        nome: tutor.nome || '',
        email: tutor.email || '',
        telefone: tutor.telefone || '',
        endereco: tutor.endereco || '',
        cpf: tutor.cpf || 0,
      })
    }
  }, [tutor])

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
