import * as Location from 'expo-location'
import { LocationAccuracy } from 'expo-location'
import * as TaskManager from 'expo-task-manager'
import React, { FC, useEffect, useState } from 'react'
import { Button, Text } from 'react-native-elements'
import { LOCATION_TASK_NAME, onBackgroundLocationChanged } from '../bootstrap/location'
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
      console.log({ status })
      setCanLocate(status === 'granted')
    })
  }, [])

  useEffect(() => {
    if (!canLocate) return

    const unsubs: (() => void)[] = []

    ;(async () => {
      const isAvailable = await TaskManager.isAvailableAsync()
      if (isAvailable) {
        const isRegistered = await TaskManager.isTaskRegisteredAsync(LOCATION_TASK_NAME)
        if (isRegistered) {
          await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
            accuracy: Location.Accuracy.BestForNavigation,
            showsBackgroundLocationIndicator: true,
            pausesUpdatesAutomatically: true,
            activityType: Location.ActivityType.AutomotiveNavigation,
          })
          unsubs.push(
            onBackgroundLocationChanged((e) => {
              dispatch(locationChanged(e.location?.coords))
            })
          )
          unsubs.push(() => {
            Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME).catch((e) => {
              console.error(e)
            })
          })
          return
        }
      }
      unsubs.push(
        (
          await Location.watchPositionAsync(
            {
              accuracy: LocationAccuracy.BestForNavigation,
            },
            (e) => {
              dispatch(locationChanged(e.coords))
            }
          )
        ).remove
      )
    })()

    return () => {
      unsubs.forEach((u) => u())
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
