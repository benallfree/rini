import React, { FC } from 'react'
import { View } from 'react-native'

export const Pill: FC = (props) => {
  const { children } = props
  return (
    <View
      style={{
        width: 50,
        flex: 1,
      }}>
      {children}
    </View>
  )
}
