import { initialize as _init, Point } from 'georedis'
import { RedisClient } from 'redis'

export const initialize = (client: RedisClient) => {
  const _geo = _init(client)

  return {
    delete() {
      return new Promise<void>((resolve, reject) => {
        _geo.delete((err) => {
          if (err) {
            reject(err)
            return
          }
          resolve()
        })
      })
    },
    removeLocations(locationNames: string[]) {
      return new Promise<boolean>((resolve, reject) => {
        _geo.removeLocations(locationNames, (err, reply) => {
          if (err) {
            reject(err)
            return
          }
          resolve(reply)
        })
      })
    },
    addLocation(locationName: string, position: Point) {
      return new Promise<boolean>((resolve, reject) => {
        _geo.addLocation(locationName, position, (err, reply) => {
          if (err) {
            reject(err)
            return
          }
          resolve(reply)
        })
      })
    },
  }
}
