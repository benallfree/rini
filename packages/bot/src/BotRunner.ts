import { createClientNetcode } from '@rini/client'
import { Bot } from './BotFileProvider'
import { RouteService } from './RouteService'

export const createBotRunner = (
  bot: Bot,
  routeService: RouteService,
  speedMs = 100,
  updateMs = 500
) => {
  const { points } = routeService
  const splitIdx = Math.floor(Math.random() * points.length - 1)
  const a = points.slice(0, splitIdx)
  const b = points.slice(splitIdx)
  const final = [...b, ...a]

  ;(async () => {
    const client = createClientNetcode(bot.idToken)

    const { onConnect, onDisconnect, isConnected } = client

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
      clearTimeout(mtid)
      clearTimeout(ptid)
    })
  })()

  return {}
}

export type BotRunner = ReturnType<typeof createBotRunner>
