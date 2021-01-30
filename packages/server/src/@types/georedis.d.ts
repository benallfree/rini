/// <reference types="@types/redis" />

declare module 'georedis' {
  export type Point = {
    latitude: number
    longitude: number
  }

  export type StandardCallback = (err: Error, reply: boolean) => void

  export type GeoRedis = {
    delete(callback: (err: Error) => void): void
    removeLocations(locationNames: string[], callback: StandardCallback): void
    addLocation(
      locationName: string,
      position: Point,
      callback: StandardCallback
    ): void
  }

  export function initialize(client: any): GeoRedis
}
