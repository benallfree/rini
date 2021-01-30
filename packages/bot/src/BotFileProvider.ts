export type Bot = {
  idToken: string
  uid: string
}

export type BotCollection = {
  [_: string]: Bot
}

export const createBotFileProvider = () => {
  const bots: Bot[] = require('../../../.secrets/bots.json')

  const botsByIdToken: BotCollection = bots.reduce(
    (c: BotCollection, bot: Bot) => {
      c[bot.idToken] = bot
      return c
    },
    {}
  )

  let currentBotIdx = 0

  return {
    next() {
      if (currentBotIdx >= bots.length) {
        throw new Error(`No more bots`)
      }
      const bot = bots[currentBotIdx]
      currentBotIdx++
      return bot
    },
    botsByIdToken: () => botsByIdToken,
    authenticate(idToken: string) {
      return botsByIdToken[idToken]
    },
  }
}

export type BotProvider = ReturnType<typeof createBotFileProvider>
