import * as Location from 'expo-location'
import React, { FC, useEffect, useState } from 'react'
import { Button, Text } from 'react-native-elements'
import { locationService } from '../bootstrap'
import { useAppDispatch, useAppSelector } from '../store'
import { locationChanged } from '../store/slices/sessionSlice'

export const Located: FC = ({ children }) => {
  const [firstTime, setFirstTime] = useState(true)
  const [canLocate, setCanLocate] = useState(false)
  const location = useAppSelector((state) => state.session.location)
  const dispatch = useAppDispatch()

  useEffect(() => {
    Location.getPermissionsAsync().then(({ status }) => {
      setFirstTime(false)
      console.log({ status })
      setCanLocate(status === 'granted')
    })
  }, [])

  useEffect(() => {
    if (!canLocate) return

    return locationService.startLocating((e) => {
      const { location } = e
      if (!location) return
      const { coords } = location
      dispatch(locationChanged(coords))
    })
  }, [canLocate, dispatch])

  const handleRequestPermission = () => {
    Location.requestPermissionsAsync().then((res) => {
      setCanLocate(res.granted)
    })
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

  if (!location) return <Text h1>Locating...</Text>

  return <>{children}</>
}
