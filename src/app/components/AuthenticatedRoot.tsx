import React, { FC } from 'react'
import { View } from 'react-native'
import { Text } from 'react-native-elements'
import { useHasPlayerPosition } from '../hooks'
import { Map } from './Map/Map'

export const AuthenticatedRoot: FC = () => {
  const hasPlayerPosition = useHasPlayerPosition()

  console.log('AuthenticatedRoot', { hasPlayerPosition })

  if (!hasPlayerPosition) return <Text>Locating you...</Text>

  return (
    <>
      <Map />
      <View style={{ position: 'absolute', left: 10, top: 40 }}>{/* <MyXp /> */}</View>
    </>
  )
}
