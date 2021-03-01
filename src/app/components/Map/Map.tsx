import React, { FC, useCallback, useEffect, useRef, useState } from 'react'
import { Dimensions, StyleSheet, View } from 'react-native'
import { Button } from 'react-native-elements'
import MapView from 'react-native-maps'
import { useAppSelector } from '../../store'
import { Me } from './Me'
import { Others } from './Others'

export const Map: FC = () => {
  const [isAutoTracking, setIsAutoTracking] = useState(true)
  const location = useAppSelector((state) => state.profile.location)
  const mapRef = useRef<MapView>(null)
  const { latitude, longitude } = location ?? {}

  const handleReset = useCallback(() => {
    setIsAutoTracking(true)
    if (!latitude || !longitude) return
    mapRef.current?.animateCamera({ center: { latitude, longitude } })
  }, [latitude, longitude])

  useEffect(() => {
    if (!isAutoTracking) return
    if (!latitude || !longitude) return
    mapRef.current?.setCamera({ center: { latitude, longitude } })
  }, [isAutoTracking, latitude, longitude])

  const handlePanDrag = () => {
    setIsAutoTracking(false)
  }

  if (!latitude || !longitude) return null

  return (
    <View
      style={{
        backgroundColor: 'red',
        width: Dimensions.get('screen').width,
        height: Dimensions.get('screen').height,
      }}>
      <MapView
        ref={mapRef}
        style={styles.map}
        onPanDrag={handlePanDrag}
        followsUserLocation={true}
        initialRegion={{
          latitude,
          longitude,
          latitudeDelta: 0.0082,
          longitudeDelta: 0.0081,
        }}>
        <Me />
        <Others />
      </MapView>
      <View style={{ position: 'absolute', bottom: 15, right: 15 }}>
        <Button title="reset" onPress={handleReset} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  map: {
    width: Dimensions.get('screen').width,
    height: Dimensions.get('screen').height,
  },
})
