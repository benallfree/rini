import React, { FC, useMemo } from 'react'
import { View } from 'react-native'
import { Text } from 'react-native-elements'
import { Marker } from 'react-native-maps'
import Pulse from 'react-native-pulse'
import { usePlayerAvatar, usePlayerPosition } from '../../hooks'
import { Avatar } from './Avatar'

export const Me: FC = () => {
  const { salt, type, uid } = usePlayerAvatar()
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
  if (!location) return null

  return (
    <>
      <Marker coordinate={location} title={'Me'} description={'My Location'} zIndex={1000}>
        {P}
        <Avatar uid={uid} salt={salt} type={type} size={32} />
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
