import { describe, it, expect, beforeEach } from 'vitest'
import { BaseStore, StoreState } from '../BaseStore'

interface TestData {
  id: number
  name: string
}

describe('BaseStore', () => {
  let store: BaseStore<TestData>

  beforeEach(() => {
    store = new BaseStore<TestData>({
      data: null,
      loading: false,
      error: null,
    })
  })

  it('deve inicializar com estado padrão', () => {
    const state = store.state
    expect(state.data).toBeNull()
    expect(state.loading).toBe(false)
    expect(state.error).toBeNull()
  })

  it('deve retornar Observable do estado', () => {
    const state$ = store.state$
    expect(state$).toBeDefined()
    
    let receivedState: StoreState<TestData> | null = null
    const subscription = state$.subscribe((state) => {
      receivedState = state
    })
    
    expect(receivedState).toEqual({
      data: null,
      loading: false,
      error: null,
    })
    
    subscription.unsubscribe()
  })

  it('deve resetar o estado', () => {
    store.setState({ data: { id: 1, name: 'Test' }, loading: true })
    
    store.reset()
    
    const state = store.state
    expect(state.data).toBeNull()
    expect(state.loading).toBe(false)
    expect(state.error).toBeNull()
  })

  it('deve atualizar estado parcialmente', () => {
    store.setState({ loading: true })
    
    expect(store.state.loading).toBe(true)
    expect(store.state.data).toBeNull()
  })
})
