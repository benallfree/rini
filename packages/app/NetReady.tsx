import React, { FC } from 'react'
import { Text } from 'react-native-elements'
import { useNet } from './Store'

export const NetReady: FC = ({ children }) => {
  const { isConnected, isAuthenticated } = useNet()

  if (!isConnected) return <Text>Connecting...</Text>

  if (!isAuthenticated) return <Text>Handshaking...</Text>

  return <>{children}</>
}
