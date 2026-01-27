import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { tutorStore } from '../TutorStore'
import { apiFacade } from '../../services/facade'
import { mockTutor, mockTutorPaginatedResponse } from '../../test/mocks/apiFacade'
import { ApiError } from '../../types/api.types'

vi.mock('../../services/facade', () => ({
  apiFacade: {
    tutors: {
      getAll: vi.fn(),
      getById: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      deleteTutor: vi.fn(),
      uploadPhoto: vi.fn(),
      deletePhoto: vi.fn(),
      linkPet: vi.fn(),
      unlinkPet: vi.fn(),
    },
  },
}))

describe('TutorStore', () => {
  beforeEach(() => {
    tutorStore.resetFormState()
    tutorStore.resetDetailState()
    tutorStore.setSearchTerm('')
    tutorStore.setPage(0)
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('loadTutors', () => {
    it('deve carregar tutores com sucesso', async () => {
      vi.mocked(apiFacade.tutors.getAll).mockResolvedValue(mockTutorPaginatedResponse)

      await tutorStore.loadTutors(0, 10)

      const listState = tutorStore.listState
      expect(listState.data).toEqual(mockTutorPaginatedResponse)
      expect(listState.loading).toBe(false)
      expect(listState.error).toBeNull()
      expect(listState.page).toBe(0)
    })

    it('deve definir loading como true durante o carregamento', async () => {
      vi.mocked(apiFacade.tutors.getAll).mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(mockTutorPaginatedResponse), 100))
      )

      const loadPromise = tutorStore.loadTutors(0, 10)
      
      expect(tutorStore.listState.loading).toBe(true)
      
      await loadPromise
    })

    it('deve tratar erro ao carregar tutores', async () => {
      const error: ApiError = { message: 'Erro ao carregar tutores' }
      vi.mocked(apiFacade.tutors.getAll).mockRejectedValue(error)

      await expect(tutorStore.loadTutors(0, 10)).rejects.toEqual(error)

      const listState = tutorStore.listState
      expect(listState.loading).toBe(false)
      expect(listState.error).toEqual(error)
    })

    it('deve atualizar searchTerm ao carregar com busca', async () => {
      vi.mocked(apiFacade.tutors.getAll).mockResolvedValue(mockTutorPaginatedResponse)

      await tutorStore.loadTutors(0, 10, 'João')

      expect(tutorStore.listState.searchTerm).toBe('João')
    })
  })

  describe('loadTutorById', () => {
    it('deve carregar tutor por ID com sucesso', async () => {
      vi.mocked(apiFacade.tutors.getById).mockResolvedValue(mockTutor)

      await tutorStore.loadTutorById('1')

      const detailState = tutorStore.detailState
      expect(detailState.data).toEqual(mockTutor)
      expect(detailState.loading).toBe(false)
      expect(detailState.error).toBeNull()
    })

    it('deve tratar erro ao carregar tutor por ID', async () => {
      const error: ApiError = { message: 'Tutor não encontrado' }
      vi.mocked(apiFacade.tutors.getById).mockRejectedValue(error)

      await expect(tutorStore.loadTutorById('1')).rejects.toEqual(error)

      const detailState = tutorStore.detailState
      expect(detailState.error).toEqual(error)
    })
  })

  describe('createTutor', () => {
    it('deve criar tutor com sucesso', async () => {
      vi.mocked(apiFacade.tutors.create).mockResolvedValue(mockTutor)
      vi.mocked(apiFacade.tutors.getAll).mockResolvedValue(mockTutorPaginatedResponse)

      const createData = { nome: 'João Silva', email: 'joao@example.com', telefone: '11999999999', endereco: 'Rua Teste, 123', cpf: 12345678900 }
      const result = await tutorStore.createTutor(createData)

      expect(result).toEqual(mockTutor)
      expect(tutorStore.formState.data).toEqual(mockTutor)
      expect(apiFacade.tutors.create).toHaveBeenCalledWith(createData)
    })
  })

  describe('updateTutor', () => {
    it('deve atualizar tutor com sucesso', async () => {
      vi.mocked(apiFacade.tutors.update).mockResolvedValue(mockTutor)
      vi.mocked(apiFacade.tutors.getAll).mockResolvedValue(mockTutorPaginatedResponse)

      const updateData = { nome: 'João Silva Atualizado' }
      const result = await tutorStore.updateTutor('1', updateData)

      expect(result).toEqual(mockTutor)
      expect(apiFacade.tutors.update).toHaveBeenCalledWith('1', updateData)
    })
  })

  describe('setPage', () => {
    it('deve atualizar a página', () => {
      tutorStore.setPage(2)
      expect(tutorStore.listState.page).toBe(2)
    })
  })

  describe('setSearchTerm', () => {
    it('deve atualizar o termo de busca e resetar página', () => {
      tutorStore.setPage(2)
      tutorStore.setSearchTerm('João')
      
      expect(tutorStore.listState.searchTerm).toBe('João')
      expect(tutorStore.listState.page).toBe(0)
    })
  })

  describe('resetFormState', () => {
    it('deve resetar o estado do formulário', async () => {
      await tutorStore.loadTutorForForm('1')
      tutorStore.resetFormState()

      const formState = tutorStore.formState
      expect(formState.data).toBeNull()
      expect(formState.loading).toBe(false)
      expect(formState.error).toBeNull()
    })
  })

  describe('uploadPhoto', () => {
    it('deve fazer upload de foto e atualizar formState quando IDs coincidem (string)', async () => {
      const mockPhoto = { id: 1, url: 'http://example.com/photo.jpg' }
      const mockFile = new File([''], 'photo.jpg', { type: 'image/jpeg' })
      
      vi.mocked(apiFacade.tutors.uploadPhoto).mockResolvedValue(mockPhoto)
      vi.mocked(apiFacade.tutors.getById).mockResolvedValue({ ...mockTutor, id: '1' })
      
      await tutorStore.loadTutorForForm('1')
      await tutorStore.uploadPhoto('1', mockFile)

      expect(apiFacade.tutors.uploadPhoto).toHaveBeenCalledWith('1', mockFile)
      expect(tutorStore.formState.data?.foto).toEqual(mockPhoto)
    })

    it('deve fazer upload de foto e atualizar formState quando IDs coincidem (number)', async () => {
      const mockPhoto = { id: 1, url: 'http://example.com/photo.jpg' }
      const mockFile = new File([''], 'photo.jpg', { type: 'image/jpeg' })
      
      vi.mocked(apiFacade.tutors.uploadPhoto).mockResolvedValue(mockPhoto)
      vi.mocked(apiFacade.tutors.getById).mockResolvedValue(mockTutor)
      
      await tutorStore.loadTutorForForm('1')
      await tutorStore.uploadPhoto('1', mockFile)

      expect(apiFacade.tutors.uploadPhoto).toHaveBeenCalledWith('1', mockFile)
      expect(tutorStore.formState.data?.foto).toEqual(mockPhoto)
    })

    it('deve atualizar detailState quando IDs coincidem', async () => {
      const mockPhoto = { id: 1, url: 'http://example.com/photo.jpg' }
      const mockFile = new File([''], 'photo.jpg', { type: 'image/jpeg' })
      
      vi.mocked(apiFacade.tutors.uploadPhoto).mockResolvedValue(mockPhoto)
      vi.mocked(apiFacade.tutors.getById).mockResolvedValue(mockTutor)
      
      await tutorStore.loadTutorById('1')
      await tutorStore.uploadPhoto('1', mockFile)

      expect(tutorStore.detailState.data?.foto).toEqual(mockPhoto)
    })

    it('deve tratar erro ao fazer upload de foto', async () => {
      const error: ApiError = { message: 'Erro ao fazer upload' }
      const mockFile = new File([''], 'photo.jpg', { type: 'image/jpeg' })
      
      vi.mocked(apiFacade.tutors.uploadPhoto).mockRejectedValue(error)
      vi.mocked(apiFacade.tutors.getById).mockResolvedValue(mockTutor)
      
      await tutorStore.loadTutorForForm('1')
      
      await expect(tutorStore.uploadPhoto('1', mockFile)).rejects.toEqual(error)
      expect(tutorStore.formState.error).toEqual(error)
    })
  })

  describe('deletePhoto', () => {
    it('deve deletar foto e atualizar formState quando IDs coincidem (string)', async () => {
      vi.mocked(apiFacade.tutors.deletePhoto).mockResolvedValue(undefined)
      vi.mocked(apiFacade.tutors.getById).mockResolvedValue({ ...mockTutor, id: '1', foto: { id: 1, url: 'http://example.com/photo.jpg' } })
      
      await tutorStore.loadTutorForForm('1')
      await tutorStore.deletePhoto('1', '1')

      expect(apiFacade.tutors.deletePhoto).toHaveBeenCalledWith('1', '1')
      expect(tutorStore.formState.data?.foto).toBeNull()
    })

    it('deve deletar foto e atualizar formState quando IDs coincidem (number)', async () => {
      vi.mocked(apiFacade.tutors.deletePhoto).mockResolvedValue(undefined)
      vi.mocked(apiFacade.tutors.getById).mockResolvedValue({ ...mockTutor, foto: { id: 1, url: 'http://example.com/photo.jpg' } })
      
      await tutorStore.loadTutorForForm('1')
      await tutorStore.deletePhoto('1', '1')

      expect(apiFacade.tutors.deletePhoto).toHaveBeenCalledWith('1', '1')
      expect(tutorStore.formState.data?.foto).toBeNull()
    })

    it('deve atualizar detailState quando IDs coincidem', async () => {
      vi.mocked(apiFacade.tutors.deletePhoto).mockResolvedValue(undefined)
      vi.mocked(apiFacade.tutors.getById).mockResolvedValue({ ...mockTutor, foto: { id: 1, url: 'http://example.com/photo.jpg' } })
      
      await tutorStore.loadTutorById('1')
      await tutorStore.deletePhoto('1', '1')

      expect(tutorStore.detailState.data?.foto).toBeNull()
    })

    it('deve tratar erro ao deletar foto', async () => {
      const error: ApiError = { message: 'Erro ao deletar foto' }
      
      vi.mocked(apiFacade.tutors.deletePhoto).mockRejectedValue(error)
      vi.mocked(apiFacade.tutors.getById).mockResolvedValue({ ...mockTutor, foto: { id: 1, url: 'http://example.com/photo.jpg' } })
      
      await tutorStore.loadTutorForForm('1')
      
      await expect(tutorStore.deletePhoto('1', '1')).rejects.toEqual(error)
      expect(tutorStore.formState.error).toEqual(error)
    })
  })
})
