import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth'
import React, { FC, useCallback, useEffect, useState } from 'react'
import { Text } from 'react-native-elements'
import { PhoneSignIn } from './PhoneSignIn'

export const Authenticated: FC = ({ children }) => {
  const [initializing, setInitializing] = useState(true)
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null)

  // Handle user state changes
  const onAuthStateChanged = useCallback(
    (user: FirebaseAuthTypes.User | null) => {
      setUser(user)
      if (initializing) setInitializing(false)
    },
    [initializing]
  )

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(onAuthStateChanged)
    return subscriber // unsubscribe on unmount
  }, [onAuthStateChanged])

  if (initializing) return <Text h1>Loading...</Text>

  if (!user) {
    return <PhoneSignIn />
  }

  return <>{children}</>
}
