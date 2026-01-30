import { BehaviorSubject, Observable } from 'rxjs'
import { BaseStore, StoreState } from './BaseStore'
import { apiFacade } from '../services/facade'
import type {
  Pet,
  PetPaginatedResponse,
  CreatePetDto,
  UpdatePetDto,
} from '../services/facade'
import { ApiError } from '../types/api.types'

interface PetListState extends StoreState<PetPaginatedResponse> {
  page: number
  searchTerm: string
}

interface PetDetailState extends StoreState<Pet> {}

class PetStore extends BaseStore<PetPaginatedResponse> {
  private _listState$ = new BehaviorSubject<PetListState>({
    data: null,
    loading: false,
    error: null,
    page: 0,
    searchTerm: '',
  })

  private _detailState$ = new BehaviorSubject<PetDetailState>({
    data: null,
    loading: false,
    error: null,
  })

  private _formState$ = new BehaviorSubject<PetDetailState>({
    data: null,
    loading: false,
    error: null,
  })

  get listState$(): Observable<PetListState> {
    return this._listState$.asObservable()
  }

  get listState(): PetListState {
    return this._listState$.getValue()
  }

  get detailState$(): Observable<PetDetailState> {
    return this._detailState$.asObservable()
  }

  get detailState(): PetDetailState {
    return this._detailState$.getValue()
  }

  get formState$(): Observable<PetDetailState> {
    return this._formState$.asObservable()
  }

  get formState(): PetDetailState {
    return this._formState$.getValue()
  }

  async loadPets(page: number = 0, size: number = 10, searchName?: string): Promise<void> {
    const currentState = this._listState$.getValue()
    this._listState$.next({ ...currentState, loading: true, error: null })

    try {
      const response = await apiFacade.pets.getAll(page, size, searchName)
      this._listState$.next({
        ...currentState,
        data: response,
        loading: false,
        error: null,
        page,
        searchTerm: searchName || '',
      })
    } catch (error) {
      this._listState$.next({
        ...currentState,
        loading: false,
        error: error as ApiError,
      })
      throw error
    }
  }

  async loadPetById(id: string): Promise<void> {
    const currentState = this._detailState$.getValue()
    this._detailState$.next({ ...currentState, loading: true, error: null })

    try {
      const pet = await apiFacade.pets.getById(id)
      this._detailState$.next({
        data: pet,
        loading: false,
        error: null,
      })
    } catch (error) {
      this._detailState$.next({
        ...currentState,
        loading: false,
        error: error as ApiError,
      })
      throw error
    }
  }

  async loadPetForForm(id: string): Promise<void> {
    const currentState = this._formState$.getValue()
    this._formState$.next({ ...currentState, loading: true, error: null })

    try {
      const pet = await apiFacade.pets.getById(id)
      this._formState$.next({
        data: pet,
        loading: false,
        error: null,
      })
    } catch (error) {
      this._formState$.next({
        ...currentState,
        loading: false,
        error: error as ApiError,
      })
      throw error
    }
  }

  async createPet(data: CreatePetDto): Promise<Pet> {
    const currentState = this._formState$.getValue()
    this._formState$.next({ ...currentState, loading: true, error: null })

    try {
      const pet = await apiFacade.pets.create(data)
      this._formState$.next({
        data: pet,
        loading: false,
        error: null,
      })
      await this.loadPets(this.listState.page, 10, this.listState.searchTerm || undefined)
      return pet
    } catch (error) {
      this._formState$.next({
        ...currentState,
        loading: false,
        error: error as ApiError,
      })
      throw error
    }
  }

  async updatePet(id: string, data: UpdatePetDto): Promise<Pet> {
    const currentState = this._formState$.getValue()
    this._formState$.next({ ...currentState, loading: true, error: null })

    try {
      const pet = await apiFacade.pets.update(id, data)
      this._formState$.next({
        data: pet,
        loading: false,
        error: null,
      })
      await this.loadPets(this.listState.page, 10, this.listState.searchTerm || undefined)
      if (this.detailState.data?.id === pet.id) {
        await this.loadPetById(id)
      }
      return pet
    } catch (error) {
      this._formState$.next({
        ...currentState,
        loading: false,
        error: error as ApiError,
      })
      throw error
    }
  }

  async deletePet(id: string): Promise<void> {
    await apiFacade.pets.delete(id)
    await this.loadPets(this.listState.page, 10, this.listState.searchTerm || undefined)
  }

  async uploadPhoto(id: string, file: File): Promise<void> {
    const currentState = this._formState$.getValue()
    try {
      const photo = await apiFacade.pets.uploadPhoto(id, file)
      const petId = typeof currentState.data?.id === 'number'
        ? currentState.data.id.toString()
        : currentState.data?.id
      if (petId === id && currentState.data) {
        this._formState$.next({
          ...currentState,
          data: { ...currentState.data, foto: photo } as Pet,
        })
      }
      const detailState = this._detailState$.getValue()
      const detailPetId = typeof detailState.data?.id === 'number'
        ? detailState.data.id.toString()
        : detailState.data?.id
      if (detailPetId === id && detailState.data) {
        this._detailState$.next({
          ...detailState,
          data: { ...detailState.data, foto: photo } as Pet,
        })
      }
    } catch (error) {
      this._formState$.next({
        ...currentState,
        error: error as ApiError,
      })
      throw error
    }
  }

  async deletePhoto(id: string, fotoId: string): Promise<void> {
    const currentState = this._formState$.getValue()
    try {
      await apiFacade.pets.deletePhoto(id, fotoId)
      const petId = typeof currentState.data?.id === 'number' 
        ? currentState.data.id.toString() 
        : currentState.data?.id
      if (petId === id && currentState.data) {
        this._formState$.next({
          ...currentState,
          data: { ...currentState.data, foto: null } as Pet,
        })
      }
      const detailState = this._detailState$.getValue()
      const detailPetId = typeof detailState.data?.id === 'number'
        ? detailState.data.id.toString()
        : detailState.data?.id
      if (detailPetId === id && detailState.data) {
        this._detailState$.next({
          ...detailState,
          data: { ...detailState.data, foto: null } as Pet,
        })
      }
    } catch (error) {
      this._formState$.next({
        ...currentState,
        error: error as ApiError,
      })
      throw error
    }
  }

  setPage(page: number): void {
    const currentState = this._listState$.getValue()
    this._listState$.next({ ...currentState, page })
  }

  setSearchTerm(searchTerm: string): void {
    const currentState = this._listState$.getValue()
    this._listState$.next({ ...currentState, searchTerm, page: 0 })
  }

  resetFormState(): void {
    this._formState$.next({
      data: null,
      loading: false,
      error: null,
    })
  }

  resetDetailState(): void {
    this._detailState$.next({
      data: null,
      loading: false,
      error: null,
    })
  }
}

export const petStore = new PetStore({
  data: null,
  loading: false,
  error: null,
})
