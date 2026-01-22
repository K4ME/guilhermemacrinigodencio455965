import { BaseService } from '../http/baseService'

export interface PetPhoto {
  id: number
  nome: string
  contentType: string
  url: string
}

export interface Pet {
  id: number
  nome: string
  raca: string
  idade: number
  foto: PetPhoto | null
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

  async getAll(page: number = 0, size: number = 10): Promise<PetPaginatedResponse> {
    return this.get<PetPaginatedResponse>('', {
      params: {
        page,
        size,
      },
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

  async delete(id: string): Promise<void> {
    return this.delete<void>(`/${id}`)
  }
}

export const petService = new PetService()
