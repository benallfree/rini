import React, { FC } from 'react'
import { Marker } from 'react-native-maps'
import Pulse from 'react-native-pulse'
import { usePlayerPosition } from '../../hooks'

export const Me: FC = () => {
  const location = usePlayerPosition()
  if (!location) return null
  console.log('Me', location)
  return (
    <Marker coordinate={location} title={'Me'} description={'My Location'} zIndex={1000}>
      <Pulse color="blue" numPulses={3} diameter={100} speed={20} duration={2000} />
    </Marker>
  )
}
