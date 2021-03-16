import { createEngine, createRealtimeStorageProvider } from '../engine'
import { createStore } from '../engine/redux'
import { Bot } from './BotFileProvider'
import { RouteService } from './RouteService'

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
      engine.dispatch.updatePlayerMovement({
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
