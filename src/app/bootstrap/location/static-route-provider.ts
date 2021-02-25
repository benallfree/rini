import * as Location from 'expo-location'
import { createRouteService, GpxRoute } from '../../../bot/RouteService'
import { CallemHandler } from '../../../callem'

export type LocationChangedEvent = {
  location: Location.LocationObject | undefined
}

export const createStaticRouteLocationService = (points: GpxRoute) => {
  const startLocating = (handleLocationChanged: CallemHandler<LocationChangedEvent>) => {
    const rs = createRouteService(points)
    const next = rs.makeRoute(15, 500)
    let tid: ReturnType<typeof setTimeout>
    const update = async () => {
      const { lat, lng, distanceFromLast } = next()
      handleLocationChanged({
        location: {
          coords: {
            latitude: lat,
            longitude: lng,
            altitude: 0,
            accuracy: 0,
            altitudeAccuracy: 0,
            speed: 15,
            heading: 0,
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
