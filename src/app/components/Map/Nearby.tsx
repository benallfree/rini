import React, { FC } from 'react'
import { Text } from 'react-native-elements'
import { useNearbyEntityCount } from '../../hooks/hooks'

export const Nearby: FC = () => {
  const count = useNearbyEntityCount()
  return (
    <Text h3 style={{ color: 'white', textAlign: 'center' }}>
      {count}
    </Text>
  )
}
