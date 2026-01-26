import { BaseService } from '../http/baseService'

export interface PetPhoto {
  id: number
  nome: string
  contentType: string
  url: string
}

export interface Tutor {
  id: number
  nome: string
  email: string
  telefone: string
  endereco: string
  cpf: number
  foto: PetPhoto | null
  pets?: Pet[]
}

export interface Pet {
  id: number
  nome: string
  raca: string
  idade: number
  foto: PetPhoto | null
  tutores?: Tutor[]
}

export interface PetPaginatedResponse {
  page: number
  size: number
  total: number
  pageCount: number
  content: Pet[]
}

export interface CreatePetDto {
  nome: string
  raca: string
  idade: number
}

export interface UpdatePetDto extends Partial<CreatePetDto> {}

class PetService extends BaseService {
  constructor() {
    super('/v1/pets')
  }

  async getAll(page: number = 0, size: number = 10, nome?: string): Promise<PetPaginatedResponse> {
    const params: Record<string, unknown> = {
      page,
      size,
    }

    if (nome && nome.trim()) {
      params.nome = nome.trim()
    }

    return this.get<PetPaginatedResponse>('', {
      params,
    })
  }

  async getById(id: string): Promise<Pet> {
    return this.get<Pet>(`/${id}`)
  }

  async create(data: CreatePetDto): Promise<Pet> {
    return this.post<Pet>('', data)
  }

  async update(id: string, data: UpdatePetDto): Promise<Pet> {
    return this.put<Pet>(`/${id}`, data)
  }

  async deletePet(id: string): Promise<void> {
    await this.delete(`/${id}`)
  }

  async uploadPhoto(id: string, file: File): Promise<PetPhoto> {
    const formData = new FormData()
    formData.append('foto', file)

    return this.post<PetPhoto>(`/${id}/fotos`, formData)
  }
}

export const petService = new PetService()
