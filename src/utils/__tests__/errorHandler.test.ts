import { describe, it, expect } from 'vitest'
import { handleApiError } from '../errorHandler'
import { ApiError } from '../../types/api.types'

describe('errorHandler', () => {
  it('deve retornar mensagem de erro quando ApiError tem message', () => {
    const error: ApiError = { message: 'Erro de teste' }
    expect(handleApiError(error)).toBe('Erro de teste')
  })

  it('deve retornar mensagem padrão quando ApiError não tem message', () => {
    const error = {} as ApiError
    expect(handleApiError(error)).toBe('Ocorreu um erro inesperado. Tente novamente.')
  })

  it('deve retornar mensagem de erro quando ApiError tem errors', () => {
    const error = {
      errors: {
        nome: ['Nome é obrigatório'],
      },
    } as unknown as ApiError
    expect(handleApiError(error)).toBe('Nome é obrigatório')
  })

  it('deve retornar mensagem de sessão expirada para status 401', () => {
    const error = { status: 401 } as ApiError
    expect(handleApiError(error)).toBe('Sessão expirada. Por favor, faça login novamente.')
  })

  it('deve retornar mensagem de permissão negada para status 403', () => {
    const error = { status: 403 } as ApiError
    expect(handleApiError(error)).toBe('Você não tem permissão para realizar esta ação.')
  })

  it('deve retornar mensagem de recurso não encontrado para status 404', () => {
    const error = { status: 404 } as ApiError
    expect(handleApiError(error)).toBe('Recurso não encontrado.')
  })

  it('deve retornar mensagem de erro interno para status 500', () => {
    const error = { status: 500 } as ApiError
    expect(handleApiError(error)).toBe('Erro interno do servidor. Tente novamente mais tarde.')
  })
})
