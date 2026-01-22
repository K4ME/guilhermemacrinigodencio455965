import { BaseService } from '../http/baseService'
import { PetPhoto, Tutor } from './petService'

// Re-exportar Tutor de petService para manter compatibilidade
export type { Tutor }

class TutorService extends BaseService {
  constructor() {
    super('/v1/tutores')
  }

  async getById(id: number): Promise<Tutor> {
    return this.get<Tutor>(`/${id}`)
  }
}

export const tutorService = new TutorService()
