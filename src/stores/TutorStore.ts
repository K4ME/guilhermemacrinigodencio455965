import { BehaviorSubject, Observable } from 'rxjs'
import { BaseStore, StoreState } from './BaseStore'
import { apiFacade } from '../services/facade'
import type {
  Tutor,
  TutorPaginatedResponse,
  CreateTutorDto,
  UpdateTutorDto,
} from '../services/facade'
import { ApiError } from '../types/api.types'

interface TutorListState extends StoreState<TutorPaginatedResponse> {
  page: number
  searchTerm: string
}

interface TutorDetailState extends StoreState<Tutor> {}

class TutorStore extends BaseStore<TutorPaginatedResponse> {
  private _listState$ = new BehaviorSubject<TutorListState>({
    data: null,
    loading: false,
    error: null,
    page: 0,
    searchTerm: '',
  })

  private _detailState$ = new BehaviorSubject<TutorDetailState>({
    data: null,
    loading: false,
    error: null,
  })

  private _formState$ = new BehaviorSubject<TutorDetailState>({
    data: null,
    loading: false,
    error: null,
  })

  get listState$(): Observable<TutorListState> {
    return this._listState$.asObservable()
  }

  get listState(): TutorListState {
    return this._listState$.getValue()
  }

  get detailState$(): Observable<TutorDetailState> {
    return this._detailState$.asObservable()
  }

  get detailState(): TutorDetailState {
    return this._detailState$.getValue()
  }

  get formState$(): Observable<TutorDetailState> {
    return this._formState$.asObservable()
  }

  get formState(): TutorDetailState {
    return this._formState$.getValue()
  }

  async loadTutors(page: number = 0, size: number = 10, searchName?: string): Promise<void> {
    const currentState = this._listState$.getValue()
    this._listState$.next({ ...currentState, loading: true, error: null })

    try {
      const response = await apiFacade.tutors.getAll(page, size, searchName)
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

  async loadTutorById(id: string): Promise<void> {
    const currentState = this._detailState$.getValue()
    this._detailState$.next({ ...currentState, loading: true, error: null })

    try {
      const tutor = await apiFacade.tutors.getById(id)
      this._detailState$.next({
        data: tutor,
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

  async loadTutorForForm(id: string): Promise<void> {
    const currentState = this._formState$.getValue()
    this._formState$.next({ ...currentState, loading: true, error: null })

    try {
      const tutor = await apiFacade.tutors.getById(id)
      this._formState$.next({
        data: tutor,
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

  async createTutor(data: CreateTutorDto): Promise<Tutor> {
    const currentState = this._formState$.getValue()
    this._formState$.next({ ...currentState, loading: true, error: null })

    try {
      const tutor = await apiFacade.tutors.create(data)
      this._formState$.next({
        data: tutor,
        loading: false,
        error: null,
      })
      await this.loadTutors(this.listState.page, 10, this.listState.searchTerm || undefined)
      return tutor
    } catch (error) {
      this._formState$.next({
        ...currentState,
        loading: false,
        error: error as ApiError,
      })
      throw error
    }
  }

  async updateTutor(id: string, data: UpdateTutorDto): Promise<Tutor> {
    const currentState = this._formState$.getValue()
    this._formState$.next({ ...currentState, loading: true, error: null })

    try {
      const tutor = await apiFacade.tutors.update(id, data)
      this._formState$.next({
        data: tutor,
        loading: false,
        error: null,
      })
      await this.loadTutors(this.listState.page, 10, this.listState.searchTerm || undefined)
      if (this.detailState.data?.id === tutor.id) {
        await this.loadTutorById(id)
      }
      return tutor
    } catch (error) {
      this._formState$.next({
        ...currentState,
        loading: false,
        error: error as ApiError,
      })
      throw error
    }
  }

  async linkPet(tutorId: string, petId: string): Promise<void> {
    await apiFacade.tutors.linkPet(tutorId, petId)
    await this.loadTutorById(tutorId)
  }

  async unlinkPet(tutorId: string, petId: string): Promise<void> {
    await apiFacade.tutors.unlinkPet(tutorId, petId)
    await this.loadTutorById(tutorId)
  }

  async deleteTutor(id: string): Promise<void> {
    await apiFacade.tutors.delete(id)
    const detailState = this._detailState$.getValue()
    const currentId =
      typeof detailState.data?.id === 'number'
        ? detailState.data.id.toString()
        : detailState.data?.id
    if (currentId === id) {
      this._detailState$.next({ data: null, loading: false, error: null })
    }
    await this.loadTutors(this.listState.page, 10, this.listState.searchTerm || undefined)
  }

  async uploadPhoto(id: string, file: File): Promise<void> {
    const currentState = this._formState$.getValue()
    try {
      const photo = await apiFacade.tutors.uploadPhoto(id, file)
      const tutorId = typeof currentState.data?.id === 'number'
        ? currentState.data.id.toString()
        : currentState.data?.id
      if (tutorId === id && currentState.data) {
        this._formState$.next({
          ...currentState,
          data: { ...currentState.data, foto: photo } as Tutor,
        })
      }
      const detailState = this._detailState$.getValue()
      const detailTutorId = typeof detailState.data?.id === 'number'
        ? detailState.data.id.toString()
        : detailState.data?.id
      if (detailTutorId === id && detailState.data) {
        this._detailState$.next({
          ...detailState,
          data: { ...detailState.data, foto: photo } as Tutor,
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
      await apiFacade.tutors.deletePhoto(id, fotoId)
      const tutorId = typeof currentState.data?.id === 'number'
        ? currentState.data.id.toString()
        : currentState.data?.id
      if (tutorId === id && currentState.data) {
        this._formState$.next({
          ...currentState,
          data: { ...currentState.data, foto: null } as Tutor,
        })
      }
      const detailState = this._detailState$.getValue()
      const detailTutorId = typeof detailState.data?.id === 'number'
        ? detailState.data.id.toString()
        : detailState.data?.id
      if (detailTutorId === id && detailState.data) {
        this._detailState$.next({
          ...detailState,
          data: { ...detailState.data, foto: null } as Tutor,
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

export const tutorStore = new TutorStore({
  data: null,
  loading: false,
  error: null,
})
