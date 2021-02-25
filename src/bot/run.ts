import prompts from 'prompts'
import { createBotFileProvider } from './BotFileProvider'
import { createBotRunner } from './BotRunner'
import BrightonLoop from './gpx/parsed/BrightonLoop'
import { createRouteService } from './RouteService'

const rs = createRouteService(BrightonLoop)
const bd = createBotFileProvider()

;(async () => {
  const response = await prompts({
    type: 'number',
    name: 'value',
    message: 'How many bots?',
    validate: (value) => (value < 1 || value > 5000 ? `1-5000 bots` : true),
  })

  for (let i = 0; i < response.value; i++) {
    createBotRunner(bd.next(), rs)
  }
})()
