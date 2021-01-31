/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-empty-function */
import { createBotFileProvider } from '@rini/bot'
import { forEach } from '@s-libs/micro-dash'
import * as admin from 'firebase-admin'
import { initialize } from 'georedis-promised'
import { resolve } from 'path'
import { createClient } from 'redis'
import { createServerNetcode } from './createServerNetcode'

const serviceAccount = require(resolve(
  __dirname,
  '../../../.secrets/rini-1234a-firebase-adminsdk-6pwsp-a18e825d44.json'
))

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://rini-1234a-default-rtdb.firebaseio.com',
})

const bd = createBotFileProvider()

const client = createClient()

const geo = initialize(client)

;(async () => {
  await geo.delete()

  const positionExpirations: { [_: string]: number } = {}

  const purgePositions = () => {
    const now = +new Date()
    const expired: string[] = []
    forEach(positionExpirations, (exp, uid) => {
      if (now < exp) return
      expired.push(uid)
    })
    if (expired.length > 0) {
      geo.removeLocations(expired)
    }
    setTimeout(purgePositions, 1000)
  }
  setTimeout(purgePositions, 1000)

  const api = createServerNetcode({
    async getUidFromAuthToken(idToken) {
      try {
        const bot = bd.authenticate(idToken)
        if (bot) return bot.uid
        const decodedIdToken = await admin.auth().verifyIdToken(idToken)
        if (!decodedIdToken.uid) return // Silently ignore auth that fails
        return decodedIdToken.uid
      } catch (e) {
        console.error(e)
        return // Silently ignore errors
      }
    },
    async onPositionUpdate(session, msg) {
      positionExpirations[session.uid] = +new Date() + 1000
      await geo.addLocation(session.uid, msg)
      const nearby = await geo.nearby(session.uid, 50)
      console.log({ session, nearby })
      // console.log(connId, msg)
    },
  })
})()
