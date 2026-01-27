import { useEffect, useState } from 'react'
import { Observable } from 'rxjs'

export const useStore = <T>(observable: Observable<T>): T => {
  const [state, setState] = useState<T>(() => {
    let initialValue: T | undefined
    const subscription = observable.subscribe((value) => {
      initialValue = value
    })
    subscription.unsubscribe()
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
