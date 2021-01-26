import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth'
import { useEffect, useState } from 'react'
import { AsyncState } from './AsyncState'

export const useAuthSlice = () => {
  const [user, setUser] = useState<AsyncState<FirebaseAuthTypes.User | null>>({
    promised: true,
  })

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(
      (user: FirebaseAuthTypes.User | null) => {
        setUser({ promised: false, data: user })
      }
    )
    return subscriber // unsubscribe on unmount
  }, [])

  return { user, isAuthenticated: user.data && !user.data.isAnonymous }
}
