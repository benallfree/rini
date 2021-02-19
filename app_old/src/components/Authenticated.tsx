import React, { FC } from 'react'
import { Text } from 'react-native-elements'
import { useAuth } from '../Store'
import { PhoneSignIn } from './PhoneSignIn'

export const Authenticated: FC = ({ children }) => {
  const { user, isAuthenticated } = useAuth()
  if (user.promised) return <Text h1>Authenticating...</Text>

  if (!isAuthenticated) {
    return <PhoneSignIn />
  }

  return <>{children}</>
}
