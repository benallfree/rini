import * as turf from '@turf/turf'
import { Units } from '@turf/turf'
import React, { FC, useEffect, useRef } from 'react'
import { Dimensions, StyleSheet, View } from 'react-native'
import MapView, { Camera } from 'react-native-maps'
import { callem } from '../../../callem'
import { info } from '../../../engine/core/logger'
import { engine } from '../../engine'
import { useAppStore } from '../../hooks/store/useAppStore'
import { Controls } from './Controls'
import { Me } from './Me'
import { Others } from './Others'
import { Overlay } from './Overlay'

const OVERVIEW = { pitch: 0, zoom: 0, altitude: 4000 }
const DRIVING = { pitch: 80, zoom: 0, altitude: 300 }

export const Map: FC = () => {
  const isFollowingRef = useRef(
    (() => {
      const [on, emit] = callem<boolean>()
      return { onIsFollowing: on, emitIsFollowing: emit }
    })()
  )

  const store = useAppStore()
  const center = store.getState().game.player.movement
  if (!center) {
    throw new Error(`Map cannot be renered until player position is known`)
  }
  const mapState = useRef<{
    mode: 'overview' | 'driving'
    isFollowing: boolean
    camera: Camera
  }>({
    mode: 'overview',
    isFollowing: true,
    camera: {
      center,
      heading: 0,
      ...OVERVIEW,
    },
  })

  useEffect(() => {
    const unsub = engine.onPlayerMovementChanged((movement) => {
      info('position updated', movement)
      if (!movement) return
      const { latitude, longitude, heading } = (() => {
        const { latitude, longitude, heading } = movement
        // info({ movement })
        if (mapState.current.mode === 'overview' || !heading) {
          return movement
        }
        const point = turf.point([longitude, latitude])
        const distance = 1500
        const bearing = heading
        const options: { units: Units } = { units: 'feet' }
        info({ point, distance, bearing, options })
        const destination = turf.destination(point, distance, bearing, options)
        info({ destination })
        return {
          latitude: destination.geometry.coordinates[1],
          longitude: destination.geometry.coordinates[0],
          heading,
        }
      })()
      mapState.current.camera = {
        ...mapState.current.camera,
        center: { latitude, longitude },
        heading: heading !== null ? heading : mapState.current.camera.heading,
      }
      // console.log('mapState', mapState.current)
      if (!mapState.current.isFollowing) return
      mapRef.current?.setCamera({
        ...mapState.current.camera,
        heading: mapState.current.mode === 'overview' ? 0 : mapState.current.camera.heading,
      })
    })
    return unsub
  })

  const mapRef = useRef<MapView>(null)

  console.log('Map')

  const resetToFollowing = () => {
    mapState.current.isFollowing = true
    mapRef.current?.animateCamera(mapState.current.camera)
    isFollowingRef.current.emitIsFollowing(true)
  }

  const handleResetToOverview = () => {
    // console.log('resetting to overview')
    mapState.current.mode = 'overview'
    mapState.current.camera = { ...mapState.current.camera, ...OVERVIEW, heading: 0 }
    resetToFollowing()
  }

  const handleResetToDriving = () => {
    // console.log('resetting to driving')
    mapState.current.mode = 'driving'
    mapState.current.camera = { ...mapState.current.camera, ...DRIVING }
    resetToFollowing()
  }

  const handlePanDrag = () => {
    // console.log('not tracking')
    mapState.current.isFollowing = false
    isFollowingRef.current.emitIsFollowing(false)
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
      <Overlay
        startFollowing={() => resetToFollowing()}
        onIsFollowing={isFollowingRef.current.onIsFollowing}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  map: {
    width: Dimensions.get('screen').width,
    height: Dimensions.get('screen').height,
  },
})
