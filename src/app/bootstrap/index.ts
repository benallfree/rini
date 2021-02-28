import * as Device from 'expo-device'
import BrightonLoop from '../../bot/gpx/parsed/BrightonLoop'
import { createClientNetcode } from '../../client'
import { createDeviceLocationService } from './location/device-provider'
import { createStaticRouteLocationService } from './location/static-route-provider'

export const client = createClientNetcode()

export const locationService = (() => {
  if (Device.isDevice) {
    return createDeviceLocationService()
  }
  return createStaticRouteLocationService(BrightonLoop)
})()
