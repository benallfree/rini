/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-empty-function */
import { createServerNetcode } from '@rini/common'
import * as dgram from 'dgram'
import * as admin from 'firebase-admin'
import { resolve } from 'path'

const serviceAccount = require(resolve(
  __dirname,
  '../../../.secrets/rini-1234a-firebase-adminsdk-6pwsp-a18e825d44.json'
))

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://rini-1234a-default-rtdb.firebaseio.com',
})

const server = dgram.createSocket('udp4')

const netcode = createServerNetcode({
  onLogin: async (msg) => {
    const decodedIdToken = await admin.auth().verifyIdToken(msg.idToken)
    if (!decodedIdToken.uid) return // Silently ignore auth that fails
    return { uid: decodedIdToken.uid }
  },
  send: (buf, port, address) =>
    new Promise((resolve) => {
      console.log('sending message', buf)
      server.send(buf, port, address, (err, bytes) => {
        if (err) throw err
        resolve(bytes)
      })
    }),
})

server.on('error', (err) => {
  console.log(`server error:\n${err.stack}`)
  server.close()
})

server.on('message', netcode.handleSocketDataEvent)

server.on('listening', () => {
  const address = server.address()
  console.log(`server listening ${address.address}:${address.port}`)
})

server.on('close', () => console.log('closed'))

server.bind(41234)
// Prints: server listening 0.0.0.0:41234
