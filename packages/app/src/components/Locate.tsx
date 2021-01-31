import auth from '@react-native-firebase/auth'
import React, { FC, useEffect, useState } from 'react'
import { Button, Text } from 'react-native-elements'
import Geolocation from 'react-native-geolocation-service'
import { useNet } from '../Store'
import MapView, { Marker } from 'react-native-maps'
import { StyleSheet, View } from 'react-native'

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

export const Locate: FC = () => {
  const [location, setLocation] = useState<Geolocation.GeoPosition>()
  const { sendPosition } = useNet()

  useEffect(() => {
    if (!sendPosition) return
    const watchId = Geolocation.watchPosition(
      (position) => {
        console.log({ position })
        sendPosition({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        })
        setLocation(position)
      },
      (error) => {
        console.error(error)
      },
      {
        forceRequestLocation: true,
        enableHighAccuracy: true,
        fastestInterval: 500,
        distanceFilter: 1,
      }
    )
    return () => {
      Geolocation.clearWatch(watchId)
    }
  }, [sendPosition])
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
      {location && (
        <>
          <View style={styles.container}>
            <MapView
              style={styles.map}
              region={{
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
              }}
            >
              <Marker
                coordinate={location.coords}
                title={'Me'}
                description={'My Location'}
              />
            </MapView>
          </View>
        </>
      )}
    </>
  )
}
