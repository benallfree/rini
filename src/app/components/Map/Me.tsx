import React, { FC } from 'react'
import { Marker } from 'react-native-maps'
import { usePlayerPosition } from '../../hooks'

export const Me: FC = () => {
  const location = usePlayerPosition()
  if (!location) return null
  console.log('Me', location)
  return <Marker coordinate={location} title={'Me'} description={'My Location'} zIndex={1000} />
}
