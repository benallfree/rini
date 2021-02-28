import React, { FC } from 'react'
import { View } from 'react-native'
import { useNetcode } from '../hooks/useNetcode'
import { Map } from './Map/Map'
import { MyXp } from './MyXp'

export const AuthenticatedRoot: FC = () => {
  useNetcode()

  return (
    <>
      <Map />
      <View style={{ position: 'absolute', left: 10, top: 40 }}>
        <MyXp />
      </View>
    </>
  )
}
