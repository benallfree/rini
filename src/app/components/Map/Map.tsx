import React, { FC } from 'react'
import { Dimensions, StyleSheet } from 'react-native'
import MapView from 'react-native-maps'
import { useAppSelector } from '../../store'
import { Me } from './Me'
import { Others } from './Others'

export const Map: FC = () => {
  const location = useAppSelector((state) => state.session.location)
  if (!location) return null
  const { latitude, longitude } = location

  return (
    <MapView
      style={styles.map}
      region={{
        latitude,
        longitude,
        latitudeDelta: 0.0082,
        longitudeDelta: 0.0081,
      }}>
      <Me />
      <Others />
    </MapView>
  )
}

const styles = StyleSheet.create({
  map: {
    width: Dimensions.get('screen').width,
    height: Dimensions.get('screen').height,
  },
})
