import * as Location from 'expo-location'
import { createRouteService, GpxRoute } from '../../../bot/RouteService'
import { CallemHandler } from '../../../callem'

export type LocationChangedEvent = {
  location: Location.LocationObject | undefined
}

export const createStaticRouteLocationService = (points: GpxRoute) => {
  const startLocating = (handleLocationChanged: CallemHandler<LocationChangedEvent>) => {
    const rs = createRouteService([points])
    const next = rs.makeRoute(15, 500)
    let tid: ReturnType<typeof setTimeout>
    const update = () => {
      const { latitude, longitude, heading, speed } = next()
      handleLocationChanged({
        location: {
          coords: {
            latitude,
            longitude,
            altitude: 0,
            accuracy: 0,
            altitudeAccuracy: 0,
            speed,
            heading,
          },
          timestamp: +new Date(),
        },
      })
      tid = setTimeout(update, 500)
    }
    update()
    return () => {
      clearTimeout(tid)
    }
  }

  return { startLocating }
}
