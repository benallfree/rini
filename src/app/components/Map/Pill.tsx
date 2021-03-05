import React, { FC } from 'react'
import { View } from 'react-native'

export const Pill: FC = (props) => {
  const { children } = props
  return (
    <View
      style={{
        marginBottom: 5,
        flex: 1,
        width: 50,
        flexDirection: 'column',
      }}>
      {children}
    </View>
  )
}
