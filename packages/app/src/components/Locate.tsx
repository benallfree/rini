import auth from '@react-native-firebase/auth'
import React, { FC, useEffect, useState } from 'react'
import { Button, Text } from 'react-native-elements'
import Geolocation from 'react-native-geolocation-service'
import { useNet } from '../Store'

export const Locate: FC = () => {
  const [location, setLocation] = useState<Geolocation.GeoPosition>()
  const { sendPosition } = useNet()

  useEffect(() => {
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
  }, [])
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
      <Text h1>Hello world</Text>
      {location && (
        <>
          <Text h3>Lat: {location.coords.latitude}</Text>
          <Text h3>Lng: {location.coords.longitude}</Text>
        </>
      )}
    </>
  )
}
