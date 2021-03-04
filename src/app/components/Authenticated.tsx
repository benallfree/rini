import firebase from 'firebase'
import React, { FC, useEffect, useState } from 'react'
import { Text } from 'react-native-elements'
import { engine } from '../engine'
import { auth } from '../firebase'
import { PhoneSignIn } from './PhoneSignIn'

export const Authenticated: FC = ({ children }) => {
  const [firstTime, setFirstTime] = useState(true)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    // auth.signOut()
    const unsub = auth.onAuthStateChanged((user: firebase.User | null) => {
      console.log('auth state', { user })
      setFirstTime(false)

      if (!user) return
      setIsReady(true)
      engine.setPlayerUid(user.uid)
      engine.start()
    })
    return unsub // unsubscribe on unmount
  }, [])

  if (firstTime) return <Text h1>Authenticating...</Text>

  if (!isReady) {
    return <PhoneSignIn />
  }

  console.log('Authenticated')
  return <>{children}</>
}
