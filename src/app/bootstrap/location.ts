import * as Location from 'expo-location'
import * as TaskManager from 'expo-task-manager'
import { callem } from '../../callem'

export const LOCATION_TASK_NAME = 'position'

export const [onBackgroundLocationChanged, emitBackgroundLocationChanged] = callem<{
  location: Location.LocationObject | undefined
}>()

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
