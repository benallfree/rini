/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-empty-function */
import { forEach } from '@s-libs/micro-dash'
import * as admin from 'firebase-admin'
import { NearbyDC } from 'georedis'
import { dirname, resolve } from 'path'
import { createClient } from 'redis'
import { createBotFileProvider } from '../bot'
import { NearbyEntity } from '../common/NearbyEntities'
import { initialize } from '../georedis-promised'
import { createServerNetcode } from './createServerNetcode'
import { createWsProvider } from './providers/ws'

const serviceAccount = require(resolve(dirname(__filename), '../../.secrets/firebase-admin.json'))

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
    // console.log({ positionExpirations })
    forEach(positionExpirations, (exp, uid) => {
      if (now < exp) return
      expired.push(uid)
      delete positionExpirations[uid]
    })
    if (expired.length > 0) {
      // console.log('purging', expired)
      geo.removeLocations(expired)
    }
    setTimeout(purgePositions, 1000)
  }
  setTimeout(purgePositions, 1000)

  const AWARD_DISTANCE = 50

  const api = createServerNetcode({
    provider: createWsProvider(),
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
    async updatePosition(session, msg) {
      const { uid } = session
      if (!uid) {
        throw new Error(`Session UID is not available`)
      }
      positionExpirations[uid] = +new Date() + 1000
      await geo.addLocation(uid, msg)
    },
    async getNearbyPlayers(session) {
      const { uid } = session
      if (!uid) {
        throw new Error(`Session UID is not available`)
      }
      const nearby = await geo.nearby<NearbyDC>(uid, 500, {
        withCoordinates: true,
        withDistances: true,
      })
      const final = nearby
        .filter((rec) => rec.key !== session.uid)
        .map((rec) => {
          const final: NearbyEntity = {
            ...rec,
          }
          if (rec.distance <= AWARD_DISTANCE && !session.awards[rec.key]) {
            session.awards[rec.key] = +new Date()
          }
          final.awardedAt = session.awards[rec.key]
          return final
        })

      // if (!session.uid.startsWith('bot')) console.log({ session, final })
      return final
      // console.log(connId, msg)
    },
  })
})()
