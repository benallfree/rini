import { createClientNetcode } from '../client'
import { Bot } from './BotFileProvider'
import { RouteService } from './RouteService'

export const createBotRunner = (bot: Bot, routeService: RouteService, mph = 30, updateMs = 500) => {
  ;(async () => {
    const client = createClientNetcode({ idToken: bot.idToken })

    const { onDisconnect, isConnected, onNearbyEntities, connect } = client

    const next = routeService.makeRoute(Math.random() * 30 + 15, 500)

    let tid: ReturnType<typeof setTimeout>
    const move = () => {
      if (isConnected()) {
        const { lat, lng, distanceFromLast } = next()
        console.log({ lat, lng, distanceFromLast })
        client.updatePosition({
          latitude: lat,
          longitude: lng,
        })
      }
      tid = setTimeout(move, updateMs)
    }

    await connect()
    move()

    onDisconnect(() => {
      console.log('disconnected')
    })
    onNearbyEntities((e) => {
      // console.log(`Nearby entities for ${bot.uid}`, e.nearby)
    })
  })()

  return {}
}

export type BotRunner = ReturnType<typeof createBotRunner>
