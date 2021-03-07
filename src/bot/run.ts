import prompts from 'prompts'
import { createBotFileProvider } from './BotFileProvider'
import { createBotRunner } from './BotRunner'
import AmbroseLoop from './gpx/parsed/AmbroseLoop'
import Brightonloop from './gpx/parsed/BrightonLoop'
import { createRouteService } from './RouteService'

const rs = createRouteService([AmbroseLoop, Brightonloop])
const bd = createBotFileProvider()

;(async () => {
  const heartbeat = () => {
    const now = +new Date()
    if (now - last > 15 * 2) {
      // 60 fps
      console.log('Heartbeat lost', now - last - 15)
    }
    last = now
    setTimeout(heartbeat, 15)
  }
  const response = await prompts({
    type: 'number',
    name: 'value',
    message: 'How many bots?',
    validate: (value) => (value < 1 || value > 5000 ? `1-5000 bots` : true),
  })

  for (let i = 0; i < response.value; i++) {
    createBotRunner(bd.next(), rs)
  }
  let last = +new Date()
  heartbeat()
})().catch(console.error)
