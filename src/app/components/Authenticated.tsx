import firebase from 'firebase'
import React, { FC, useEffect, useState } from 'react'
import { unstable_batchedUpdates } from 'react-native'
import { Text } from 'react-native-elements'
import { error } from '../../engine/core/logger'
import { engine } from '../engine'
import { auth } from '../firebase'
import { PhoneSignIn } from './PhoneSignIn'

export const Authenticated: FC = ({ children }) => {
  const [firstTime, setFirstTime] = useState(true)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    const unsub = auth.onIdTokenChanged((user) => {
      user
        ?.getIdTokenResult()
        .then((res) => engine.dispatch.permitBetaUser(!!res.claims.beta))
        .catch(error)
    })
    return () => {
      unsub() // unsubscribe on unmount
    }
  }, [])

  useEffect(() => {
    // auth.signOut().catch(console.error)
    const unsub = auth.onAuthStateChanged((user: firebase.User | null) => {
      unstable_batchedUpdates(() => {
        setFirstTime(false)
        if (!user) return
        setIsReady(true)
        engine.dispatch.setPlayerUid(user.uid)
        engine.start().catch(console.error)
      })
    })
    return () => {
      unsub() // unsubscribe on unmount
    }
  }, [])

  if (firstTime) return <Text h1>Authenticating...</Text>

  if (!isReady) {
    return <PhoneSignIn />
  }

  return <>{children}</>
}
