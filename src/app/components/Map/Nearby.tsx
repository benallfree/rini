import React, { FC } from 'react'
import { View } from 'react-native'
import { Text } from 'react-native-elements'
import { useNearbyEntityCount } from '../../hooks/store/useNearbyEntityCount'

export const Nearby: FC = () => {
  const count = useNearbyEntityCount()
  return (
    <View>
      <Text h3 style={{ color: 'white', textAlign: 'center' }}>
        {count}
      </Text>
      <Text
        style={{
          fontSize: 8,
          alignContent: 'center',
          textAlign: 'center',
        }}>
        Nearby
      </Text>
    </View>
  )
}
