import BrightonLoop from '../../bot/gpx/parsed/BrightonLoop'
import { createClientNetcode } from '../../client'
import { createStaticRouteLocationService } from './location/static-route-provider'
export const client = createClientNetcode()

export const locationService = createStaticRouteLocationService(BrightonLoop)
