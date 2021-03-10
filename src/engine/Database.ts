import firebase from 'firebase/app'

export const IDENTICON_STYLES = {
  male: 'Male',
  female: 'Female',
  human: 'Person',
  bottts: 'Robot',
  avataaars: 'Avatar',
  identicon: 'Symbol',
  gridy: 'Mask',
}

export type IdenticonKey = keyof typeof IDENTICON_STYLES

export type AvatarSalt = string

export interface Profile {
  avatar: {
    type: IdenticonKey
    salts: {
      [_ in IdenticonKey]: AvatarSalt
    }
  }
}

export type EntityId = string

export interface Point {
  latitude: number
  longitude: number
}

export interface Bearing extends Point {
  heading: number | null
  speed: number | null
}

export interface NoncedBearing extends Bearing {
  nonce: string
}

export interface NoncedBearing_Read extends NoncedBearing {
  heading: number | null
  speed: number | null
  time: number
}

export interface NoncedBearing_Write extends NoncedBearing {
  heading: number | null
  speed: number | null
  time: typeof firebase.database.ServerValue.TIMESTAMP
}
