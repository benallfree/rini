import auth from '@react-native-firebase/auth'
import { NearbyDC } from 'georedis'
import React, { FC, useEffect, useRef, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { Button, Text } from 'react-native-elements'
import Geolocation from 'react-native-geolocation-service'
import MapView, { Marker } from 'react-native-maps'
import { useNet } from '../Store'

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    height: '100%',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
})

const usePosition = () => {
  const [position, setPosition] = useState<Geolocation.GeoPosition>()

  useEffect(() => {
    const watchId = Geolocation.watchPosition(
      (position) => {
        setPosition(position)
      },
      (error) => {
        console.error(error)
      },
      {
        forceRequestLocation: true,
        enableHighAccuracy: true,
        fastestInterval: 100,
        distanceFilter: 1,
      }
    )
    return () => {
      Geolocation.clearWatch(watchId)
    }
  }, [])

  return { position }
}

const useReportPosition = (position: Geolocation.GeoPosition | undefined) => {
  const positionRef = useRef(position)
  const { sendPosition } = useNet()
  const [nearby, setNearby] = useState<NearbyDC[]>([])

  useEffect(() => {
    positionRef.current = position
  }, [position])

  useEffect(() => {
    let tid: ReturnType<typeof setTimeout>
    const update = async () => {
      console.log('current', positionRef.current)
      if (positionRef.current && sendPosition) {
        try {
          const nearby = await sendPosition({
            latitude: positionRef.current.coords.latitude,
            longitude: positionRef.current.coords.longitude,
          })
          setNearby(nearby || [])
        } catch (e) {
          console.error(e)
        }
      }
      tid = setTimeout(update, 500)
    }
    console.log('starting position watcher')
    tid = setTimeout(update, 500)
    return () => {
      console.log('stopping position watcher')

      clearTimeout(tid)
    }
  }, [sendPosition])

  return { nearby }
}

export const Locate: FC = () => {
  const { position } = usePosition()
  const { nearby } = useReportPosition(position)

  console.log('render', { nearby })

  if (!position) {
    return <Text h1>Locating...</Text>
  }

  return (
    <>
      <Button
        title="Log Out"
        onPress={() =>
          auth()
            .signOut()
            .then(() => console.log('User signed out!'))
        }
      />
      {position && (
        <>
          <View style={styles.container}>
            <MapView
              style={styles.map}
              region={{
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
              }}
            >
              {nearby.map((player) => (
                <Marker
                  pinColor={'blue'}
                  key={player.key}
                  coordinate={player}
                  title={player.key}
                  description={player.distance.toString()}
                  zIndex={50}
                />
              ))}
              <Marker
                coordinate={position.coords}
                title={'Me'}
                description={'My Location'}
                zIndex={1000}
              />
            </MapView>
          </View>
        </>
      )}
    </>
  )
}
