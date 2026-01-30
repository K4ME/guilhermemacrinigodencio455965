import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { petStore } from '../PetStore'
import { apiFacade } from '../../services/facade'
import { mockPet, mockPetPaginatedResponse } from '../../test/mocks/apiFacade'
import { ApiError } from '../../types/api.types'

vi.mock('../../services/facade', () => ({
  apiFacade: {
    pets: {
      getAll: vi.fn(),
      getById: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      deletePet: vi.fn(),
      uploadPhoto: vi.fn(),
      deletePhoto: vi.fn(),
    },
  },
}))

describe('PetStore', () => {
  beforeEach(() => {
    petStore.resetFormState()
    petStore.resetDetailState()
    petStore.setSearchTerm('')
    petStore.setPage(0)
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('loadPets', () => {
    it('deve carregar pets com sucesso', async () => {
      vi.mocked(apiFacade.pets.getAll).mockResolvedValue(mockPetPaginatedResponse)

      await petStore.loadPets(0, 10)

      const listState = petStore.listState
      expect(listState.data).toEqual(mockPetPaginatedResponse)
      expect(listState.loading).toBe(false)
      expect(listState.error).toBeNull()
      expect(listState.page).toBe(0)
    })

    it('deve definir loading como true durante o carregamento', async () => {
      vi.mocked(apiFacade.pets.getAll).mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(mockPetPaginatedResponse), 100))
      )

      const loadPromise = petStore.loadPets(0, 10)
      
      expect(petStore.listState.loading).toBe(true)
      
      await loadPromise
    })

    it('deve tratar erro ao carregar pets', async () => {
      const error: ApiError = { message: 'Erro ao carregar pets' }
      vi.mocked(apiFacade.pets.getAll).mockRejectedValue(error)

      await expect(petStore.loadPets(0, 10)).rejects.toEqual(error)

      const listState = petStore.listState
      expect(listState.loading).toBe(false)
      expect(listState.error).toEqual(error)
    })

    it('deve atualizar searchTerm ao carregar com busca', async () => {
      vi.mocked(apiFacade.pets.getAll).mockResolvedValue(mockPetPaginatedResponse)

      await petStore.loadPets(0, 10, 'Rex')

      expect(petStore.listState.searchTerm).toBe('Rex')
    })
  })

  describe('loadPetById', () => {
    it('deve carregar pet por ID com sucesso', async () => {
      vi.mocked(apiFacade.pets.getById).mockResolvedValue(mockPet)

      await petStore.loadPetById('1')

      const detailState = petStore.detailState
      expect(detailState.data).toEqual(mockPet)
      expect(detailState.loading).toBe(false)
      expect(detailState.error).toBeNull()
    })

    it('deve tratar erro ao carregar pet por ID', async () => {
      const error: ApiError = { message: 'Pet não encontrado' }
      vi.mocked(apiFacade.pets.getById).mockRejectedValue(error)

      await expect(petStore.loadPetById('1')).rejects.toEqual(error)

      const detailState = petStore.detailState
      expect(detailState.error).toEqual(error)
    })
  })

  describe('createPet', () => {
    it('deve criar pet com sucesso', async () => {
      vi.mocked(apiFacade.pets.create).mockResolvedValue(mockPet)
      vi.mocked(apiFacade.pets.getAll).mockResolvedValue(mockPetPaginatedResponse)

      const createData = { nome: 'Rex', raca: 'Labrador', idade: 3 }
      const result = await petStore.createPet(createData)

      expect(result).toEqual(mockPet)
      expect(petStore.formState.data).toEqual(mockPet)
      expect(apiFacade.pets.create).toHaveBeenCalledWith(createData)
    })
  })

  describe('updatePet', () => {
    it('deve atualizar pet com sucesso', async () => {
      vi.mocked(apiFacade.pets.update).mockResolvedValue(mockPet)
      vi.mocked(apiFacade.pets.getAll).mockResolvedValue(mockPetPaginatedResponse)

      const updateData = { nome: 'Rex Atualizado' }
      const result = await petStore.updatePet('1', updateData)

      expect(result).toEqual(mockPet)
      expect(apiFacade.pets.update).toHaveBeenCalledWith('1', updateData)
    })
  })

  describe('setPage', () => {
    it('deve atualizar a página', () => {
      petStore.setPage(2)
      expect(petStore.listState.page).toBe(2)
    })
  })

  describe('setSearchTerm', () => {
    it('deve atualizar o termo de busca e resetar página', () => {
      petStore.setPage(2)
      petStore.setSearchTerm('Rex')
      
      expect(petStore.listState.searchTerm).toBe('Rex')
      expect(petStore.listState.page).toBe(0)
    })
  })

  describe('resetFormState', () => {
    it('deve resetar o estado do formulário', async () => {
      vi.mocked(apiFacade.pets.getById).mockResolvedValue(mockPet)
      await petStore.loadPetForForm('1')
      petStore.resetFormState()

      const formState = petStore.formState
      expect(formState.data).toBeNull()
      expect(formState.loading).toBe(false)
      expect(formState.error).toBeNull()
    })
  })

  describe('uploadPhoto', () => {
    it('deve fazer upload de foto e atualizar formState quando IDs coincidem (string)', async () => {
      const mockPhoto = { id: 1, url: 'http://example.com/photo.jpg' }
      const mockFile = new File([''], 'photo.jpg', { type: 'image/jpeg' })
      
      vi.mocked(apiFacade.pets.uploadPhoto).mockResolvedValue(mockPhoto)
      vi.mocked(apiFacade.pets.getById).mockResolvedValue({ ...mockPet, id: '1' })
      
      await petStore.loadPetForForm('1')
      await petStore.uploadPhoto('1', mockFile)

      expect(apiFacade.pets.uploadPhoto).toHaveBeenCalledWith('1', mockFile)
      expect(petStore.formState.data?.foto).toEqual(mockPhoto)
    })

    it('deve fazer upload de foto e atualizar formState quando IDs coincidem (number)', async () => {
      const mockPhoto = { id: 1, url: 'http://example.com/photo.jpg' }
      const mockFile = new File([''], 'photo.jpg', { type: 'image/jpeg' })
      
      vi.mocked(apiFacade.pets.uploadPhoto).mockResolvedValue(mockPhoto)
      vi.mocked(apiFacade.pets.getById).mockResolvedValue(mockPet)
      
      await petStore.loadPetForForm('1')
      await petStore.uploadPhoto('1', mockFile)

      expect(apiFacade.pets.uploadPhoto).toHaveBeenCalledWith('1', mockFile)
      expect(petStore.formState.data?.foto).toEqual(mockPhoto)
    })

    it('deve atualizar detailState quando IDs coincidem', async () => {
      const mockPhoto = { id: 1, url: 'http://example.com/photo.jpg' }
      const mockFile = new File([''], 'photo.jpg', { type: 'image/jpeg' })
      
      vi.mocked(apiFacade.pets.uploadPhoto).mockResolvedValue(mockPhoto)
      vi.mocked(apiFacade.pets.getById).mockResolvedValue(mockPet)
      
      await petStore.loadPetById('1')
      await petStore.uploadPhoto('1', mockFile)

      expect(petStore.detailState.data?.foto).toEqual(mockPhoto)
    })

    it('deve tratar erro ao fazer upload de foto', async () => {
      const error: ApiError = { message: 'Erro ao fazer upload' }
      const mockFile = new File([''], 'photo.jpg', { type: 'image/jpeg' })
      
      vi.mocked(apiFacade.pets.uploadPhoto).mockRejectedValue(error)
      vi.mocked(apiFacade.pets.getById).mockResolvedValue(mockPet)
      
      await petStore.loadPetForForm('1')
      
      await expect(petStore.uploadPhoto('1', mockFile)).rejects.toEqual(error)
      expect(petStore.formState.error).toEqual(error)
    })
  })

  describe('deletePhoto', () => {
    it('deve deletar foto e atualizar formState quando IDs coincidem (string)', async () => {
      vi.mocked(apiFacade.pets.deletePhoto).mockResolvedValue(undefined)
      vi.mocked(apiFacade.pets.getById).mockResolvedValue({ ...mockPet, id: '1', foto: { id: 1, url: 'http://example.com/photo.jpg' } })
      
      await petStore.loadPetForForm('1')
      await petStore.deletePhoto('1', '1')

      expect(apiFacade.pets.deletePhoto).toHaveBeenCalledWith('1', '1')
      expect(petStore.formState.data?.foto).toBeNull()
    })

    it('deve deletar foto e atualizar formState quando IDs coincidem (number)', async () => {
      vi.mocked(apiFacade.pets.deletePhoto).mockResolvedValue(undefined)
      vi.mocked(apiFacade.pets.getById).mockResolvedValue({ ...mockPet, foto: { id: 1, url: 'http://example.com/photo.jpg' } })
      
      await petStore.loadPetForForm('1')
      await petStore.deletePhoto('1', '1')

      expect(apiFacade.pets.deletePhoto).toHaveBeenCalledWith('1', '1')
      expect(petStore.formState.data?.foto).toBeNull()
    })

    it('deve atualizar detailState quando IDs coincidem', async () => {
      vi.mocked(apiFacade.pets.deletePhoto).mockResolvedValue(undefined)
      vi.mocked(apiFacade.pets.getById).mockResolvedValue({ ...mockPet, foto: { id: 1, url: 'http://example.com/photo.jpg' } })
      
      await petStore.loadPetById('1')
      await petStore.deletePhoto('1', '1')

      expect(petStore.detailState.data?.foto).toBeNull()
    })

    it('deve tratar erro ao deletar foto', async () => {
      const error: ApiError = { message: 'Erro ao deletar foto' }
      
      vi.mocked(apiFacade.pets.deletePhoto).mockRejectedValue(error)
      vi.mocked(apiFacade.pets.getById).mockResolvedValue({ ...mockPet, foto: { id: 1, url: 'http://example.com/photo.jpg' } })
      
      await petStore.loadPetForForm('1')
      
      await expect(petStore.deletePhoto('1', '1')).rejects.toEqual(error)
      expect(petStore.formState.error).toEqual(error)
    })
  })
})
