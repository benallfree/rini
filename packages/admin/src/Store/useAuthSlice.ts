import { useEffect, useState } from 'react'
import { AsyncState } from './AsyncState'
import firebase from 'firebase'

const auth = firebase.auth
export const useAuthSlice = () => {
  const [user, setUser] = useState<AsyncState<firebase.User | null>>({
    promised: true,
  })
  const [idToken, setIdToken] = useState<string>()

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged((user) => {
      setUser({ promised: false, data: user })
    })
    return subscriber // unsubscribe on unmount
  }, [])

  useEffect(() => {
    if (!user.data) {
      setIdToken(undefined)
      return
    }
    user.data
      .getIdToken()
      .then(setIdToken)
      .catch((e) => {
        console.error(e)
        setIdToken(undefined)
      })
  }, [user.data])

  return { user, isAuthenticated: user.data && !user.data.isAnonymous, idToken }
}
