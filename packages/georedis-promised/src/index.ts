import type { NearbyOptions, Point, NearbyReturnTypes } from 'georedis'
import { initialize as _init } from 'georedis'
import { RedisClient } from 'redis'

export const initialize = (client: RedisClient) => {
  const _geo = _init(client)

  const exec = <TRet>(fn: any, args: any[] = []) =>
    new Promise<TRet>((resolve, reject) => {
      fn(
        ...[
          ...args,
          (err: Error, result: TRet) => {
            if (err) {
              reject(err)
              return
            }
            resolve(result)
          },
        ]
      )
    })
  return {
    delete: () => exec<void>(_geo.delete.bind(_geo)),
    removeLocations: (locationNames: string[]) =>
      exec<boolean>(_geo.removeLocations.bind(_geo), [locationNames]),
    addLocation: (locationName: string, position: Point) =>
      exec<boolean>(_geo.addLocation.bind(_geo), [locationName, position]),
    nearby: <TRet extends NearbyReturnTypes>(
      locationName: string,
      radius: number,
      options?: Partial<NearbyOptions>
    ) => exec<TRet[]>(_geo.nearby.bind(_geo), [locationName, radius, options]),
  }
}
