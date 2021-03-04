import memoizeOne from 'memoize-one'
import React, { FC, useEffect, useMemo, useRef } from 'react'
import { Dimensions, GestureResponderEvent, StyleSheet, View } from 'react-native'
import { Icon } from 'react-native-elements'
import MapView from 'react-native-maps'
import { Point } from '../../../engine/store/types'
import { engine } from '../../engine'
import { usePlayerPosition } from '../../hooks'
import { Me } from './Me'
import { Others } from './Others'

export const Reset: FC<{
  size?: number
  isActive?: boolean
  onPress?: (event: GestureResponderEvent) => void
}> = (props) => {
  const { size, onPress, isActive } = {
    onPress: () => {},
    isActive: true,
    size: 50,
    ...props,
  }
  const iconSize = size * 0.8
  const leftTop = (size - iconSize) / 2
  return (
    <View style={{ width: size, height: size }}>
      <View
        style={{
          opacity: 0.4,
          backgroundColor: isActive ? 'blue' : 'black',
          borderRadius: size / 2,
          width: size,
          height: size,
        }}></View>
      <View style={{ position: 'absolute', top: leftTop, left: leftTop + 1 }}>
        <Icon type="font-awesome-5" name="compass" onPress={onPress} size={iconSize} />
      </View>
    </View>
  )
}
export const Map: FC = () => {
  const mapState = useRef<{ isAutoTracking: boolean; location?: Point }>({
    isAutoTracking: true,
  })
  const mapRef = useRef<MapView>(null)
  const location = usePlayerPosition()

  useEffect(() => {
    const moveMap = memoizeOne((latitude: number, longitude: number) => {
      mapRef.current?.setCamera({
        center: { latitude, longitude },
      })
    })
    const unsub = engine.onPlayerPositionUpdated((currentLocation) => {
      if (!mapState.current.isAutoTracking) return
      if (!currentLocation) return
      mapState.current.location = currentLocation
      const { latitude, longitude } = currentLocation
      moveMap(latitude, longitude)
    })

    return () => unsub()
  }, [])

  const { latitude, longitude } = location ?? {}

  const render = useMemo(() => {
    console.log({ latitude, longitude })
    if (!latitude || !longitude) return <></>

    const handleReset = () => {
      mapState.current.isAutoTracking = true
      mapRef.current?.animateCamera({ center: mapState.current.location, zoom: 20, altitude: 5000 })
    }

    const handlePanDrag = () => {
      mapState.current.isAutoTracking = false
    }

    console.log('Map')
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
        <View style={{ position: 'absolute', right: 15, top: 50 }}>
          <Reset onPress={handleReset} isActive={mapState.current.isAutoTracking} />
        </View>
      </View>
    )
  }, [!!latitude, !!longitude])

  return render
}

const styles = StyleSheet.create({
  map: {
    width: Dimensions.get('screen').width,
    height: Dimensions.get('screen').height,
  },
})
