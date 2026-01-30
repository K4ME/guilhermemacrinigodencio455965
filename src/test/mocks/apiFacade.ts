import { vi } from 'vitest'
import type {
  Pet,
  PetPaginatedResponse,
  Tutor,
  TutorPaginatedResponse,
  LoginResponse,
} from '../../services/facade'

export const mockPet: Pet = {
  id: 1,
  nome: 'Rex',
  raca: 'Labrador',
  idade: 3,
  foto: null,
  tutores: [],
}

export const mockPetPaginatedResponse: PetPaginatedResponse = {
  content: [mockPet],
  page: 0,
  size: 10,
  total: 1,
  pageCount: 1,
}

export const mockTutor: Tutor = {
  id: 1,
  nome: 'João Silva',
  email: 'joao@example.com',
  telefone: '11999999999',
  endereco: 'Rua Teste, 123',
  cpf: 12345678900,
  foto: null,
  pets: [],
}

export const mockTutorPaginatedResponse: TutorPaginatedResponse = {
  content: [mockTutor],
  page: 0,
  size: 10,
  total: 1,
  pageCount: 1,
}

export const mockLoginResponse: LoginResponse = {
  access_token: 'mock-token',
  refresh_token: 'mock-refresh-token',
  expires_in: 3600,
  refresh_expires_in: 7200,
}

export const createMockApiFacade = () => ({
  pets: {
    getAll: vi.fn().mockResolvedValue(mockPetPaginatedResponse),
    getById: vi.fn().mockResolvedValue(mockPet),
    create: vi.fn().mockResolvedValue(mockPet),
    update: vi.fn().mockResolvedValue(mockPet),
    deletePet: vi.fn().mockResolvedValue(undefined),
    uploadPhoto: vi.fn().mockResolvedValue({ id: 1, url: 'http://example.com/photo.jpg' }),
    deletePhoto: vi.fn().mockResolvedValue(undefined),
    createAndLinkToTutor: vi.fn().mockResolvedValue(mockPet),
    deleteAndUnlink: vi.fn().mockResolvedValue(undefined),
  },
  tutors: {
    getAll: vi.fn().mockResolvedValue(mockTutorPaginatedResponse),
    getById: vi.fn().mockResolvedValue(mockTutor),
    create: vi.fn().mockResolvedValue(mockTutor),
    update: vi.fn().mockResolvedValue(mockTutor),
    linkPet: vi.fn().mockResolvedValue(undefined),
    unlinkPet: vi.fn().mockResolvedValue(undefined),
    uploadPhoto: vi.fn().mockResolvedValue({ id: 1, url: 'http://example.com/photo.jpg' }),
    deletePhoto: vi.fn().mockResolvedValue(undefined),
    createWithPets: vi.fn().mockResolvedValue(mockTutor),
    unlinkAllPets: vi.fn().mockResolvedValue(undefined),
  },
  auth: {
    login: vi.fn().mockResolvedValue(mockLoginResponse),
    logout: vi.fn().mockResolvedValue(undefined),
    isAuthenticated: vi.fn().mockReturnValue(true),
  },
  getPetWithTutors: vi.fn().mockResolvedValue(mockPet),
  getTutorWithPets: vi.fn().mockResolvedValue(mockTutor),
})
