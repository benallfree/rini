import memoizeOne from 'memoize-one'
import React, { FC, useEffect, useMemo, useRef } from 'react'
import { Dimensions, StyleSheet, View } from 'react-native'
import { Button } from 'react-native-elements'
import MapView from 'react-native-maps'
import { engine } from '../../engine'
import { usePlayerPosition } from '../../hooks'
import { Point } from '../../store/types'
import { Me } from './Me'
import { Others } from './Others'

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
        <View style={{ position: 'absolute', bottom: 15, right: 15 }}>
          <Button title="reset" onPress={handleReset} />
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
