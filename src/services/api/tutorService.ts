import { BaseService } from '../http/baseService'
import { PetPhoto, Tutor } from './petService'

// Re-exportar Tutor de petService para manter compatibilidade
export type { Tutor }

export interface CreateTutorDto {
  nome: string
  email: string
  telefone: string
  endereco: string
  cpf: number
}

export interface UpdateTutorDto extends Partial<CreateTutorDto> {}

export interface TutorPaginatedResponse {
  page: number
  size: number
  total: number
  pageCount: number
  content: Tutor[]
}

class TutorService extends BaseService {
  constructor() {
    super('/v1/tutores')
  }

  async getAll(page: number = 0, size: number = 10, nome?: string): Promise<TutorPaginatedResponse> {
    const params: Record<string, unknown> = {
      page,
      size,
    }

    if (nome && nome.trim()) {
      params.nome = nome.trim()
    }

    return this.get<TutorPaginatedResponse>('', {
      params,
    })
  }

  async getById(id: string): Promise<Tutor> {
    return this.get<Tutor>(`/${id}`)
  }

  async create(data: CreateTutorDto): Promise<Tutor> {
    return this.post<Tutor>('', data)
  }

  async update(id: string, data: UpdateTutorDto): Promise<Tutor> {
    return this.put<Tutor>(`/${id}`, data)
  }

  async uploadPhoto(id: string, file: File): Promise<PetPhoto> {
    const formData = new FormData()
    formData.append('foto', file)

    return this.post<PetPhoto>(`/${id}/fotos`, formData)
  }
}

export const tutorService = new TutorService()
