import { petService } from '../api/petService'
import { tutorService } from '../api/tutorService'
import { authService } from '../api/authService'
import type {
  Pet,
  PetPhoto,
  PetPaginatedResponse,
  CreatePetDto,
  UpdatePetDto,
  Tutor,
} from '../api/petService'
import type {
  CreateTutorDto,
  UpdateTutorDto,
  TutorPaginatedResponse,
} from '../api/tutorService'
import type { LoginCredentials, LoginResponse } from '../api/authService'

class ApiFacade {
  readonly pets = {
    getAll: (page: number = 0, size: number = 10, nome?: string): Promise<PetPaginatedResponse> => {
      return petService.getAll(page, size, nome)
    },

    getById: (id: string): Promise<Pet> => {
      return petService.getById(id)
    },

    create: (data: CreatePetDto): Promise<Pet> => {
      return petService.create(data)
    },

    update: (id: string, data: UpdatePetDto): Promise<Pet> => {
      return petService.update(id, data)
    },

    delete: (id: string): Promise<void> => {
      return petService.deletePet(id)
    },

    uploadPhoto: (id: string, file: File): Promise<PetPhoto> => {
      return petService.uploadPhoto(id, file)
    },

    deletePhoto: (id: string, fotoId: string): Promise<void> => {
      return petService.deletePhoto(id, fotoId)
    },

    createAndLinkToTutor: async (petData: CreatePetDto, tutorId: string): Promise<Pet> => {
      const pet = await petService.create(petData)
      await tutorService.linkPet(tutorId, pet.id.toString())
      return pet
    },

    deleteAndUnlink: async (id: string): Promise<void> => {
      const pet = await petService.getById(id)
      
      if (pet.tutores && pet.tutores.length > 0) {
        await Promise.all(
          pet.tutores.map((tutor) => tutorService.unlinkPet(tutor.id.toString(), id))
        )
      }
      
      await petService.deletePet(id)
    },
  }

  readonly tutors = {
    getAll: (page: number = 0, size: number = 10, nome?: string): Promise<TutorPaginatedResponse> => {
      return tutorService.getAll(page, size, nome)
    },

    getById: (id: string): Promise<Tutor> => {
      return tutorService.getById(id)
    },

    create: (data: CreateTutorDto): Promise<Tutor> => {
      return tutorService.create(data)
    },

    update: (id: string, data: UpdateTutorDto): Promise<Tutor> => {
      return tutorService.update(id, data)
    },

    delete: (id: string): Promise<void> => {
      return tutorService.deleteTutor(id)
    },

    linkPet: (tutorId: string, petId: string): Promise<void> => {
      return tutorService.linkPet(tutorId, petId)
    },

    unlinkPet: (tutorId: string, petId: string): Promise<void> => {
      return tutorService.unlinkPet(tutorId, petId)
    },

    uploadPhoto: (id: string, file: File): Promise<PetPhoto> => {
      return tutorService.uploadPhoto(id, file)
    },

    deletePhoto: (id: string, fotoId: string): Promise<void> => {
      return tutorService.deletePhoto(id, fotoId)
    },

    createWithPets: async (tutorData: CreateTutorDto, petIds: string[]): Promise<Tutor> => {
      const tutor = await tutorService.create(tutorData)
      
      if (petIds.length > 0) {
        await Promise.all(
          petIds.map((petId) => tutorService.linkPet(tutor.id.toString(), petId))
        )
      }
      
      return tutor
    },

    unlinkAllPets: async (id: string): Promise<void> => {
      const tutor = await tutorService.getById(id)
      
      if (tutor.pets && tutor.pets.length > 0) {
        await Promise.all(
          tutor.pets.map((pet) => tutorService.unlinkPet(id, pet.id.toString()))
        )
      }
    },
  }

  readonly auth = {
    login: (credentials: LoginCredentials): Promise<LoginResponse> => {
      return authService.login(credentials)
    },

    logout: (): Promise<void> => {
      return authService.logout()
    },

    isAuthenticated: (): boolean => {
      const token = localStorage.getItem('auth_token')
      return !!token
    },
  }

  async getPetWithTutors(id: string): Promise<Pet & { tutores: Tutor[] }> {
    const pet = await petService.getById(id)
    
    if (pet.tutores && pet.tutores.length > 0) {
      return pet as Pet & { tutores: Tutor[] }
    }
    
    return { ...pet, tutores: [] }
  }

  async getTutorWithPets(id: string): Promise<Tutor & { pets: Pet[] }> {
    const tutor = await tutorService.getById(id)
    
    if (tutor.pets && tutor.pets.length > 0) {
      return tutor as Tutor & { pets: Pet[] }
    }
    
    return { ...tutor, pets: [] }
  }
}

export const apiFacade = new ApiFacade()
