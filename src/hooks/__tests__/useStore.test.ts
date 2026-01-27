import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { BehaviorSubject } from 'rxjs'
import { useStore } from '../useStore'

describe('useStore', () => {
  let subject: BehaviorSubject<number>

  beforeEach(() => {
    subject = new BehaviorSubject(0)
  })

  afterEach(() => {
    subject.complete()
  })

  it('deve retornar o valor inicial do BehaviorSubject', () => {
    const { result } = renderHook(() => useStore(subject.asObservable()))
    
    expect(result.current).toBe(0)
  })

  it('deve atualizar quando o BehaviorSubject emite novo valor', async () => {
    const { result } = renderHook(() => useStore(subject.asObservable()))
    
    expect(result.current).toBe(0)
    
    await waitFor(async () => {
      subject.next(1)
      await new Promise(resolve => setTimeout(resolve, 0))
      expect(result.current).toBe(1)
    })
  })

  it('deve atualizar múltiplas vezes', async () => {
    const { result } = renderHook(() => useStore(subject.asObservable()))
    
    await waitFor(async () => {
      subject.next(1)
      await new Promise(resolve => setTimeout(resolve, 0))
      expect(result.current).toBe(1)
    })
    
    await waitFor(async () => {
      subject.next(2)
      await new Promise(resolve => setTimeout(resolve, 0))
      expect(result.current).toBe(2)
    })
    
    await waitFor(async () => {
      subject.next(3)
      await new Promise(resolve => setTimeout(resolve, 0))
      expect(result.current).toBe(3)
    })
  })

  it('deve limpar subscription ao desmontar', () => {
    const unsubscribeSpy = vi.fn()
    const subscribeSpy = vi.spyOn(subject, 'subscribe').mockImplementation((observer) => {
      const subscription = {
        unsubscribe: unsubscribeSpy,
      }
      return subscription as any
    })

    const { unmount } = renderHook(() => useStore(subject.asObservable()))
    
    expect(subscribeSpy).toHaveBeenCalled()
    
    unmount()
    
    expect(unsubscribeSpy).toHaveBeenCalled()
    
    subscribeSpy.mockRestore()
  })
})
