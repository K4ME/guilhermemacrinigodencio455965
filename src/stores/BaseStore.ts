import { BehaviorSubject, Observable } from 'rxjs'

export interface StoreState<T> {
  data: T | null
  loading: boolean
  error: any | null
}

export class BaseStore<T> {
  protected readonly _state$: BehaviorSubject<StoreState<T>>

  constructor(initialState: StoreState<T>) {
    this._state$ = new BehaviorSubject<StoreState<T>>(initialState)
  }

  get state(): StoreState<T> {
    return this._state$.getValue()
  }

  get state$(): Observable<StoreState<T>> {
    return this._state$.asObservable()
  }

  protected setState(partialState: Partial<StoreState<T>>): void {
    const currentState = this._state$.getValue()
    this._state$.next({ ...currentState, ...partialState })
  }

  protected setLoading(loading: boolean): void {
    this.setState({ loading })
  }

  protected setError(error: any | null): void {
    this.setState({ error, loading: false })
  }

  protected setData(data: T | null): void {
    this.setState({ data, loading: false, error: null })
  }

  reset(): void {
    this.setState({
      data: null,
      loading: false,
      error: null,
    })
  }
}
