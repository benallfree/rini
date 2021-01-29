/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-empty-function */
import * as admin from 'firebase-admin'
import { resolve } from 'path'
import { createServerNetcode } from './createServerNetcode'

const serviceAccount = require(resolve(
  __dirname,
  '../../../.secrets/rini-1234a-firebase-adminsdk-6pwsp-a18e825d44.json'
))

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://rini-1234a-default-rtdb.firebaseio.com',
})

createServerNetcode({
  onLogin: async (connId, msg) => {
    try {
      const decodedIdToken = await admin.auth().verifyIdToken(msg.idToken)
      if (!decodedIdToken.uid) return // Silently ignore auth that fails
      return { uid: decodedIdToken.uid }
    } catch (e) {
      console.error(e)
      return // Silently ignore errors
    }
  },
  async onPositionUpdate(connId, msg) {
    console.log(connId, msg)
  },
})

// Prints: server listening 0.0.0.0:41234
