import { BaseService } from '../http/baseService'

// Exemplo de tipos - ajustar conforme a API real
export interface Pet {
  id: string
  name: string
  species?: string
  breed?: string
  age?: number
  createdAt?: string
  updatedAt?: string
}

export interface CreatePetDto {
  name: string
  species?: string
  breed?: string
  age?: number
}

export interface UpdatePetDto extends Partial<CreatePetDto> {}

class PetService extends BaseService {
  constructor() {
    super('/pets') // Ajustar conforme o endpoint real da API
  }

  async getAll(): Promise<Pet[]> {
    return this.get<Pet[]>()
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
