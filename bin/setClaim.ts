/// <reference types="node"/>
import * as admin from 'firebase-admin'
import { dirname, resolve } from 'path'

const serviceAccount = require(resolve(dirname(__filename), '../.secrets/firebase-admin.json'))

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://rini-1234a-default-rtdb.firebaseio.com',
})
;(async () => {
  const uid = `PFOtuigEswd8AqFsQFFfw9KtFSv2` // 805-403-2380
  await admin.auth().setCustomUserClaims(uid, { beta: true })

  console.log('success')
})().catch(console.error)
