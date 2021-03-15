import * as admin from 'firebase-admin'
import { dirname, resolve } from 'path'
import { createEngine, createRealtimeStorageProvider } from '../engine'
import { createStore } from '../engine/redux'
import { Bot } from './BotFileProvider'
import { RouteService } from './RouteService'

const serviceAccount = require(resolve(dirname(__filename), '../../.secrets/firebase-admin.json'))

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://rini-1234a-default-rtdb.firebaseio.com',
})

const storage = createRealtimeStorageProvider()

export const createBotRunner = (bot: Bot, routeService: RouteService, mph = 30, updateMs = 500) => {
  ;(() => {
    const store = createStore()
    const engine = createEngine({
      uid: bot.uid,
      storage,
      store,
      onDeferredDispatch: (actions) => actions.forEach((a) => a()),
    })

    engine.start().catch(console.error)

    const next = routeService.makeRoute(Math.random() * mph + 15, 500)

    const move = () => {
      const { latitude, longitude, heading, speed } = next()
      // console.log({ lat, lng, distanceFromLast })
      engine.updatePlayerPosition({
        latitude,
        longitude,
        heading,
        speed,
      })
      setTimeout(move, updateMs)
    }

    move()
  })()

  return {}
}

export type BotRunner = ReturnType<typeof createBotRunner>
