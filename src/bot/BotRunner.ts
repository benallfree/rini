import * as admin from 'firebase-admin'
import { dirname, resolve } from 'path'
import { createEngine } from '../engine/createEngine'
import { nanoid } from '../nanoid'
import { Bot } from './BotFileProvider'
import { RouteService } from './RouteService'

const serviceAccount = require(resolve(dirname(__filename), '../../.secrets/firebase-admin.json'))

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://rini-1234a-default-rtdb.firebaseio.com',
})

export const createBotRunner = (bot: Bot, routeService: RouteService, mph = 30, updateMs = 500) => {
  ;(async () => {
    const engine = createEngine({ uid: bot.uid, nanoid })
    engine.setPlayerUid(bot.uid)
    engine.onNearbyEntityHit((e) => {
      // console.log('hit!', e)
    })
    engine.watchNearbyEntityIds((ids) => {
      // console.log('Nearby', ids)
    })
    engine.start()

    const next = routeService.makeRoute(Math.random() * 30 + 15, 500)

    const move = () => {
      const { lat, lng, distanceFromLast } = next()
      // console.log({ lat, lng, distanceFromLast })
      engine.updatePlayerPosition({
        latitude: lat,
        longitude: lng,
      })
      setTimeout(move, updateMs)
    }

    move()
  })()

  return {}
}

export type BotRunner = ReturnType<typeof createBotRunner>
