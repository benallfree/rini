export type Bot = {
  idToken: string
  uid: string
}

export const createBotAuthenticator = () => {
  type BotCollection = {
    [_: string]: Bot
  }
  const botsByIdToken: BotCollection = require('../../../.secrets/bots.json').reduce(
    (c: BotCollection, bot: Bot) => {
      c[bot.idToken] = bot
      return c
    },
    {}
  )

  return {
    authenticate(idToken: string) {
      return botsByIdToken[idToken]
    },
  }
}

export type BotAuthenticator = ReturnType<typeof createBotAuthenticator>
