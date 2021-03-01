import * as admin from 'firebase-admin'
import { dirname, resolve } from 'path'
import { makeStore } from '../app/store'
import { locationChanged, login } from '../app/store/slices/sessionSlice'
import { Bot } from './BotFileProvider'
import { RouteService } from './RouteService'

const serviceAccount = require(resolve(dirname(__filename), '../../.secrets/firebase-admin.json'))

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://rini-1234a-default-rtdb.firebaseio.com',
})

export const createBotRunner = (bot: Bot, routeService: RouteService, mph = 30, updateMs = 500) => {
  ;(async () => {
    const store = makeStore()

    const next = routeService.makeRoute(Math.random() * 30 + 15, 500)

    let tid: ReturnType<typeof setTimeout>
    const move = () => {
      const { lat, lng, distanceFromLast } = next()
      console.log({ lat, lng, distanceFromLast })
      store.dispatch(
        locationChanged({
          latitude: lat,
          longitude: lng,
        })
      )
      tid = setTimeout(move, updateMs)
    }

    store.dispatch(login(bot))
    move()
  })()

  return {}
}

export type BotRunner = ReturnType<typeof createBotRunner>
