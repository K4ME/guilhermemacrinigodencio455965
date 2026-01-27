import { ApiError } from '../types/api.types'

export const handleApiError = (error: ApiError): string => {
  if (error.errors) {
    const firstError = Object.values(error.errors)[0]
    return Array.isArray(firstError) ? firstError[0] : firstError
  }

  if (error.status === 401) {
    return 'Sessão expirada. Por favor, faça login novamente.'
  }

  if (error.status === 403) {
    return 'Você não tem permissão para realizar esta ação.'
  }

  if (error.status === 404) {
    return 'Recurso não encontrado.'
  }

  if (error.status === 500) {
    return 'Erro interno do servidor. Tente novamente mais tarde.'
  }

  return error.message || 'Ocorreu um erro inesperado. Tente novamente.'
}
