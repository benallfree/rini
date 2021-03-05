import React, { FC, useMemo } from 'react'
import { Image, Text } from 'react-native-elements'
import { Marker } from 'react-native-maps'
import Pulse from 'react-native-pulse'
import { BundledImages } from '../../assets/images'
import { usePlayerPosition } from '../../hooks'

export const Me: FC = () => {
  const location = usePlayerPosition()
  console.log('Me', location)
  const P = useMemo(
    () => (
      <Pulse
        color="red"
        numPulses={3}
        diameter={100}
        speed={20}
        duration={2000}
        pulseStyle={{ opacity: 0.1 }}
      />
    ),
    []
  )
  if (!location) return null

  return (
    <>
      <Marker coordinate={location} title={'Me'} description={'My Location'} zIndex={1000}>
        {P}
        <Image
          source={BundledImages.Tesla}
          style={{ width: 32, height: 32 }}
          resizeMode="contain"
        />
        <Text>La{location.latitude}</Text>
        <Text>Lo{location.longitude}</Text>
        <Text>H{location.heading}</Text>
      </Marker>
    </>
  )
}
