import firebase from 'firebase/app'

export const IDENTICON_STYLES = {
  male: 'Male',
  female: 'Female',
  human: 'Person',
  bottts: 'Robot',
  avataaars: 'Avatar',
  jdenticon: 'Symbol',
  gridy: 'Mask',
}

export type IdenticonKey = keyof typeof IDENTICON_STYLES

export type AvatarSalt = string

export type EntityId = string

export interface Point {
  latitude: number
  longitude: number
}

export interface Movement extends Point {
  heading: number | null
  speed: number | null
}

export interface Movement_Read extends Movement {
  heading: number | null
  speed: number | null
  time: number
}

export interface Movement_Write extends Movement {
  heading: number | null
  speed: number | null
  time: typeof firebase.database.ServerValue.TIMESTAMP
}
