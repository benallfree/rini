import React, { FC } from 'react'
import { Text } from 'react-native-elements'
import { useNearbyEntityIds } from '../../hooks'

export const Nearby: FC = () => {
  const nearbyIds = useNearbyEntityIds()
  return <Text>Nearby: {nearbyIds.length}</Text>
}
