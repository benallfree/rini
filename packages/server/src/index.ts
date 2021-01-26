/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-empty-function */
import {
  handleMessage,
  MessageTypes,
  onRawMessage,
  RawMessage,
} from '@rini/common'
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

server.on('error', (err) => {
  console.log(`server error:\n${err.stack}`)
  server.close()
})

server.on('message', handleMessage)

const dispatch: { [_ in MessageTypes]: (e: RawMessage) => void } = {
  [MessageTypes.Login]: async (e) => {
    const idToken = e.payload.toString()
    const decodedIdToken = await admin.auth().verifyIdToken(idToken)

    console.log({ decodedIdToken })
    console.log('auth?', e.payload.toString())
  },
  [MessageTypes.Ack]: () => {}, // Noop
}

onRawMessage((e) => {
  console.log('got a message', { e })
  try {
    dispatch[e.type](e)
  } catch (e) {
    console.error(e)
  }
})

server.on('listening', () => {
  const address = server.address()
  console.log(`server listening ${address.address}:${address.port}`)
})

server.bind(41234)
// Prints: server listening 0.0.0.0:41234
