import React, { FC, useEffect, useRef } from 'react'
import { Dimensions, StyleSheet, View } from 'react-native'
import MapView, { Camera } from 'react-native-maps'
import { engine } from '../../engine'
import { Controls } from './Controls'
import { Me } from './Me'
import { Others } from './Others'

const OVERVIEW = { pitch: 0, zoom: 0, altitude: 4000 }
const DRIVING = { pitch: 50, zoom: 0, altitude: 500 }

export const Map: FC = () => {
  const center = engine.select((state) => state.position)
  if (!center) {
    throw new Error(`Map cannot be renered until player position is known`)
  }
  const mapState = useRef<{
    mode: 'overview' | 'driving'
    isAutoTracking: boolean
    camera: Camera
  }>({
    mode: 'overview',
    isAutoTracking: true,
    camera: {
      center,
      heading: 0,
      ...OVERVIEW,
    },
  })

  useEffect(() => {
    const unsub = engine.watchPlayerPosition((bearing) => {
      if (!bearing) return
      const { latitude, longitude, heading } = bearing
      mapState.current.camera = {
        ...mapState.current.camera,
        center: { latitude, longitude },
        heading: heading !== null ? heading : mapState.current.camera.heading,
      }
      // console.log('mapState', mapState.current)
      if (!mapState.current.isAutoTracking) return
      mapRef.current?.setCamera({
        ...mapState.current.camera,
        heading: mapState.current.mode === 'overview' ? 0 : mapState.current.camera.heading + 70,
      })
    })
    return unsub
  })

  const mapRef = useRef<MapView>(null)

  console.log('Map')

  const handleResetToOverview = () => {
    console.log('resetting to overview')
    mapState.current.isAutoTracking = true
    mapState.current.mode = 'overview'
    mapState.current.camera = { ...mapState.current.camera, ...OVERVIEW, heading: 0 }
    mapRef.current?.animateCamera(mapState.current.camera)
  }

  const handleResetToDriving = () => {
    console.log('resetting to driving')
    mapState.current.isAutoTracking = true
    mapState.current.mode = 'driving'
    mapState.current.camera = { ...mapState.current.camera, ...DRIVING }
    mapRef.current?.animateCamera(mapState.current.camera)
  }

  const handlePanDrag = () => {
    console.log('not tracking')
    mapState.current.isAutoTracking = false
  }

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
        onTouchStart={handlePanDrag}
        followsUserLocation={true}
        initialCamera={mapState.current.camera}>
        <Me />
        <Others />
      </MapView>
      <View
        style={{
          position: 'absolute',
          right: 0,
          top: 250,
          width: 60,
          height: 200,
        }}>
        <Controls
          onOverviewPress={handleResetToOverview}
          onNavigatePress={handleResetToDriving}
          width={60}
          height={200}
        />
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
