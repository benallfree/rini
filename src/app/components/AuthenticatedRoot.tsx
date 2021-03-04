import React, { FC } from 'react'
import { View } from 'react-native'
import { Map } from './Map/Map'

export const AuthenticatedRoot: FC = () => {
  console.log('AuthenticatedRoot')
  return (
    <>
      <Map />
      <View style={{ position: 'absolute', left: 10, top: 40 }}>{/* <MyXp /> */}</View>
    </>
  )
}
