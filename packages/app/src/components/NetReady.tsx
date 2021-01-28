import React, { FC } from 'react'
import { Text } from 'react-native-elements'
import { useNet } from '../Store'

export const NetReady: FC = ({ children }) => {
  const { isAuthenticated, authenticationError } = useNet()

  if (authenticationError) return <Text>Reconnecting to mother ship...</Text>
  if (!isAuthenticated) return <Text>Connecting to mother ship...</Text>

  return <>{children}</>
}
