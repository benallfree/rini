import prompts from 'prompts'
import { createBotDataProvider } from './BotDataProvider'
import { createBotRunner } from './BotRunner'
import { createRouteService } from './RouteService'

const rs = createRouteService()
const bd = createBotDataProvider()

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
