import React, { FC } from 'react'
import { Image } from 'react-native-elements'
import { Marker } from 'react-native-maps'
import Pulse from 'react-native-pulse'
import { BundledImages } from '../../assets/images'
import { usePlayerPosition } from '../../hooks'

export const Me: FC = () => {
  const location = usePlayerPosition()
  if (!location) return null
  // console.log('Me', location)
  return (
    <Marker coordinate={location} title={'Me'} description={'My Location'} zIndex={1000}>
      <Pulse
        color="red"
        numPulses={3}
        diameter={100}
        speed={20}
        duration={2000}
        pulseStyle={{ opacity: 0.1 }}
      />
      <Image source={BundledImages.Tesla} style={{ width: 32, height: 32 }} resizeMode="contain" />
    </Marker>
  )
}
