import { createClientNetcode } from '../client'
import { Bot } from './BotFileProvider'
import { RouteService } from './RouteService'

export const createBotRunner = (
  bot: Bot,
  routeService: RouteService,
  speedMs = 1000,
  updateMs = 500
) => {
  const { points } = routeService
  const splitIdx = Math.floor(Math.random() * points.length - 1)
  const a = points.slice(0, splitIdx)
  const b = points.slice(splitIdx)
  const final = (() => {
    const final = [...b, ...a]
    if (Math.random() > 0.5) return final
    return final.reverse()
  })()

  ;(async () => {
    const client = createClientNetcode(bot.idToken)

    const { onConnect, onDisconnect, isConnected, onNearbyEntities } = client

    let idx = 0

    let mtid: ReturnType<typeof setTimeout>
    const move = () => {
      if (!isConnected()) return
      idx++
      if (idx >= final.length) idx = 0
      // console.log(`Moved to `, final[idx])
      mtid = setTimeout(move, speedMs)
    }

    let ptid: ReturnType<typeof setTimeout>
    const ping = () => {
      // console.log(`Ping from `, final[idx])
      if (isConnected()) {
        client.updatePosition({
          latitude: final[idx].lat,
          longitude: final[idx].lon,
        })
        ptid = setTimeout(ping, updateMs)
      }
    }

    onConnect(() => {
      move()
      ping()
    })
    onDisconnect(() => {
      console.log('disconnected')
      clearTimeout(mtid)
      clearTimeout(ptid)
    })
    onNearbyEntities((e) => {
      console.log(`Nearby entities`, e.nearby)
    })
  })()

  return {}
}

export type BotRunner = ReturnType<typeof createBotRunner>
