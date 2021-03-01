import firebase from 'firebase'
import React, { FC, useEffect, useState } from 'react'
import { Text } from 'react-native-elements'
import { useAppDispatch, useAppSelector } from '../store'
import { login, logout } from '../store/slices/sessionSlice'
import { PhoneSignIn } from './PhoneSignIn'

export const Authenticated: FC = ({ children }) => {
  const [firstTime, setFirstTime] = useState(true)
  const idToken = useAppSelector((state) => state.session.tokens.idToken)
  const dispatch = useAppDispatch()

  useEffect(() => {
    const unsub = firebase.auth().onAuthStateChanged((user: firebase.User | null) => {
      console.log('auth state', { user })
      setFirstTime(false)
    })
    return unsub // unsubscribe on unmount
  }, [])

  useEffect(() => {
    firebase.auth().onIdTokenChanged((user) => {
      if (!user) {
        dispatch(logout())
        return
      }
      user
        .getIdToken()
        .then((idToken) => {
          console.log('id token', { idToken })
          dispatch(login({ uid: user.uid, idToken }))
        })
        .catch((e) => {
          console.error(e)
          dispatch(logout())
        })
    })
  }, [dispatch])

  if (firstTime) return <Text h1>Authenticating...</Text>

  const { currentUser } = firebase.auth()
  if (!currentUser) {
    return <PhoneSignIn />
  }

  if (!idToken) return <Text h1>Signing in...</Text>

  return <>{children}</>
}
