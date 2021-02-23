import * as Location from 'expo-location'
import React, { FC, useEffect, useState } from 'react'
import { Button, Text } from 'react-native-elements'
import { LOCATION_TASK_NAME, onLocationChanged } from '../bootstrap/location'
import { useAppDispatch, useAppSelector } from '../store'
import { locationChanged } from '../store/sessionSlice'

export const Located: FC = ({ children }) => {
  const [firstTime, setFirstTime] = useState(true)
  const [canLocate, setCanLocate] = useState(false)
  const location = useAppSelector((state) => state.session.location)
  const dispatch = useAppDispatch()

  useEffect(() => {
    Location.getPermissionsAsync().then(({ status }) => {
      setFirstTime(false)
      setCanLocate(status === 'granted')
    })
  }, [])

  useEffect(() => {
    if (!canLocate) return

    Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
      accuracy: Location.Accuracy.BestForNavigation,
      showsBackgroundLocationIndicator: true,
      pausesUpdatesAutomatically: true,
      activityType: Location.ActivityType.AutomotiveNavigation,
    }).catch((e) => {
      console.error(e)
    })

    const unsub = onLocationChanged((e) => {
      dispatch(locationChanged(e.location?.coords))
    })

    return () => {
      unsub()
      Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME).catch((e) => {
        console.error(e)
      })
    }
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
