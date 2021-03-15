import * as admin from 'firebase-admin'
import { dirname, resolve } from 'path'
import { auth } from '../app/firebase'

const serviceAccount = require(resolve(dirname(__filename), '../../.secrets/firebase-admin.json'))

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://rini-1234a-default-rtdb.firebaseio.com',
})

export const loginWebFromAdmin = async (uid: string) => {
  await admin.auth().setCustomUserClaims(uid, { admin: true })
  const token = await admin.auth().createCustomToken(uid)
  await auth.signInWithCustomToken(token)
  const newId = auth.currentUser?.uid
  if (!newId) {
    throw new Error(`Failed to log in as ${uid}`)
  }
  console.log(`Signed in as ${newId}`)
}
