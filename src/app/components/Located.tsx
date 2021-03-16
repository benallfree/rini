import * as Location from 'expo-location'
import React, { FC, useEffect, useState } from 'react'
import { Button, Text } from 'react-native-elements'
import { locationService } from '../bootstrap'
import { engine } from '../engine'
import { auth } from '../firebase'

export const Located: FC = ({ children }) => {
  const [firstTime, setFirstTime] = useState(true)
  const [canLocate, setCanLocate] = useState(false)
  const [hasLocation, setHasLocation] = useState(false)

  useEffect(() => {
    Location.getPermissionsAsync()
      .then(({ status }) => {
        setFirstTime(false)
        // console.log({ status })
        setCanLocate(status === 'granted')
      })
      .catch((e) => console.error(`Error querying locatin permission`, e))
  }, [])

  useEffect(() => {
    if (!canLocate) return

    return locationService.startLocating((e) => {
      const { location } = e
      if (!location) return
      const { coords } = location
      setHasLocation(true)

      const { uid } = auth.currentUser ?? {}
      if (uid) {
        engine.dispatch.updatePlayerMovement({ ...coords })
      } else {
        // console.log('got location, awaiting uid', location)
      }
    })
  }, [canLocate])

  const handleRequestPermission = () => {
    Location.requestPermissionsAsync()
      .then((res) => {
        setCanLocate(res.granted)
      })
      .catch((e) => console.error(`Error requesting location permission`, e))
  }

  if (firstTime) return <Text h1>Determining location permission...</Text>

  if (!canLocate) {
    return (
      <>
        <Text h1>Location Permission Needed</Text>
        <Button title="Grant Permission Now" onPress={handleRequestPermission}></Button>
      </>
    )
  }

  if (!hasLocation) return <Text h1>Locating...</Text>

  return <>{children}</>
}
