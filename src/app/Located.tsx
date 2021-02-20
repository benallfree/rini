import * as Location from 'expo-location'
import * as TaskManager from 'expo-task-manager'
import React, { FC, useEffect, useState } from 'react'
import { Button, Text } from 'react-native-elements'
import { callem } from '../callem'
import { useAppDispatch, useAppSelector } from './Store/hooks'
import { locationChanged } from './Store/sessionSlice'
const TASK_NAME = 'position'

const [onLocationChanged, emitLocationChanged] = callem<{
  location: Location.LocationObject | undefined
}>()

TaskManager.defineTask(TASK_NAME, ({ data, error }) => {
  if (error) {
    console.error(error)
    return
  }
  const location = (data as {
    locations: Location.LocationObject[]
  }).locations.pop()
  emitLocationChanged({ location })
})

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

    Location.startLocationUpdatesAsync(TASK_NAME, {
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
      Location.stopLocationUpdatesAsync(TASK_NAME).catch((e) => {
        console.error(e)
      })
    }
  }, [canLocate])

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
        <Button
          title="Grant Permission Now"
          onPress={handleRequestPermission}
        ></Button>
      </>
    )
  }

  if (!location) return <Text h1>Locating...</Text>

  return <>{children}</>
}
