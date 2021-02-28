import * as Location from 'expo-location'
import { LocationAccuracy } from 'expo-location'
import * as TaskManager from 'expo-task-manager'
import { callem, CallemHandler } from '../../../callem'

export type LocationChangedEvent = {
  location: Location.LocationObject | undefined
}

export const createDeviceLocationService = () => {
  const LOCATION_TASK_NAME = 'position'

  const [
    onBackgroundLocationChanged,
    emitBackgroundLocationChanged,
  ] = callem<LocationChangedEvent>()

  TaskManager.defineTask(LOCATION_TASK_NAME, ({ data, error }) => {
    if (error) {
      console.error(error)
      return
    }
    const location = (data as {
      locations: Location.LocationObject[]
    }).locations.pop()
    emitBackgroundLocationChanged({ location })
  })

  const startLocating = (handleLocationChanged: CallemHandler<LocationChangedEvent>) => {
    const unsubs: (() => void)[] = []

    ;(async () => {
      const isAvailable = await TaskManager.isAvailableAsync()
      if (isAvailable) {
        const isRegistered = await TaskManager.isTaskRegisteredAsync(LOCATION_TASK_NAME)
        if (isRegistered) {
          await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
            accuracy: Location.Accuracy.Highest,
            showsBackgroundLocationIndicator: true,
            pausesUpdatesAutomatically: true,
            activityType: Location.ActivityType.AutomotiveNavigation,
          })
          unsubs.push(onBackgroundLocationChanged(handleLocationChanged))
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
              accuracy: LocationAccuracy.Highest,
            },
            (e) => {
              handleLocationChanged({ location: e })
            }
          )
        ).remove
      )
    })()

    return () => {
      unsubs.forEach((u) => u())
    }
  }

  return { startLocating }
}
