import firebase from 'firebase'
import * as admin from 'firebase-admin'
import { dirname, resolve } from 'path'
import { auth, db } from '../app/firebase'
import { DEFAULT_AVATAR_URI } from '../engine/redux/DEFAULT_AVATAR'

const serviceAccount = require(resolve(dirname(__filename), '../../.secrets/firebase-admin.json'))

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://rini-1234a-default-rtdb.firebaseio.com',
})

const login = async (uid: string) => {
  await admin.auth().setCustomUserClaims(uid, { admin: true })
  const token = await admin.auth().createCustomToken(uid)
  await auth.signInWithCustomToken(token)
  const newId = auth.currentUser?.uid
  if (!newId) {
    throw new Error(`Failed to log in as ${uid}`)
  }
  console.log(`Signed in as ${newId}`)
}

;(async () => {
  // Initialize
  await (async () => {
    const uid = `PFOtuigEswd8AqFsQFFfw9KtFSv2` // 805-403-2380
    await login(uid)
    await admin.auth().setCustomUserClaims(uid, { admin: true })
  })()

  await (async () => {
    const uid = `rfP4mN9Pe8NjLTgxk3KMQYgEsTp2` // 555-555-1212
    await login(uid)

    await db.ref(`/grid/122456/${uid}`).set({
      heading: 123,
      latitude: 90,
      longitude: 80,
      speed: 123,
      nonce: 'foo',
      time: firebase.database.ServerValue.TIMESTAMP,
    })

    const args = {
      saved: {
        '01234567890123456789012345678912': {
          type: 'male',
          locationFound: '0123456789',
          uri: DEFAULT_AVATAR_URI,
        },
      },
      current: '01234567890123456789012345678912',
    }
    console.log(JSON.stringify(args, null, 2))
    await db.ref(`profiles/${uid}/avatars`).set(args)
  })()
  console.log('success')
})().catch(console.error)
