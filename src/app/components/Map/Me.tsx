import React, { FC, useMemo } from 'react'
import { View } from 'react-native'
import { Text } from 'react-native-elements'
import { Marker } from 'react-native-maps'
import Pulse from 'react-native-pulse'
import { usePlayerPosition, useUid } from '../../hooks'
import { useAvatar } from './Settings/useAvatar'

export const Me: FC = () => {
  const uid = useUid()
  const { Avatar } = useAvatar(32)
  const location = usePlayerPosition()
  // console.log('Me', location)
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
  if (!location || !uid) return null

  return (
    <>
      <Marker coordinate={location} title={'Me'} description={'My Location'} zIndex={1000}>
        {P}
        <Avatar />
        <View style={{ position: 'absolute', width: 300, height: 50, top: 40, left: -80 }}>
          <Text style={{ fontFamily: 'Courier' }}>
            La {location.latitude.toString().padEnd(20, '0')}
          </Text>
          <Text style={{ fontFamily: 'Courier' }}>
            Lo {location.longitude.toString().padEnd(20, '0')}
          </Text>
          <Text style={{ fontFamily: 'Courier' }}>
            He {location.heading?.toString().padEnd(20, '0')}
          </Text>
        </View>
      </Marker>
    </>
  )
}
