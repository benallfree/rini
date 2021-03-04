import firebase from 'firebase'
import React, { FC, useEffect, useState } from 'react'
import { Text } from 'react-native-elements'
import { engine } from '../engine'
import { auth } from '../firebase'
import { PhoneSignIn } from './PhoneSignIn'

export const Authenticated: FC = ({ children }) => {
  const [firstTime, setFirstTime] = useState(true)

  useEffect(() => {
    const unsub = firebase.auth().onAuthStateChanged((user: firebase.User | null) => {
      console.log('auth state', { user })
      if (!user) return
      engine.setPlayerUid(user.uid)
      engine.start()
      setFirstTime(false)
    })
    return unsub // unsubscribe on unmount
  }, [])

  if (firstTime) return <Text h1>Authenticating...</Text>

  const { currentUser } = auth
  if (!currentUser) {
    return <PhoneSignIn />
  }

  console.log('Authenticated')
  return <>{children}</>
}
