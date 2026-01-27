import { useEffect, useState } from 'react'
import { Observable } from 'rxjs'

export const useStore = <T>(observable: Observable<T>): T => {
  const [state, setState] = useState<T>(() => {
    let initialValue: T | undefined
    let subscription: any
    try {
      subscription = observable.subscribe((value) => {
        initialValue = value
      })
      if (subscription && typeof subscription.unsubscribe === 'function') {
        subscription.unsubscribe()
      }
    } catch (error) {
      console.warn('Erro ao obter valor inicial do observable:', error)
    }
    return initialValue as T
  })

  useEffect(() => {
    const subscription = observable.subscribe((value) => {
      setState(value)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [observable])

  return state
}
