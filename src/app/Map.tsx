import React, { FC } from 'react'
import { Dimensions, StyleSheet } from 'react-native'
import MapView, { Marker } from 'react-native-maps'
import { useAppDispatch, useAppSelector } from './Store'

const Me: FC = () => {
  const location = useAppSelector((state) => state.session.location)
  if (!location) return null

  return (
    <Marker
      coordinate={location}
      title={'Me'}
      description={'My Location'}
      zIndex={1000}
    />
  )
}

export const Map: FC = () => {
  const location = useAppSelector((state) => state.session.location)
  const dispatch = useAppDispatch()
  if (!location) return null
  const { latitude, longitude } = location

  return (
    <MapView
      style={styles.map}
      region={{
        latitude,
        longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      }}
    >
      <Me />
    </MapView>
  )
}

const styles = StyleSheet.create({
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
})
