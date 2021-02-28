import { NearbyDC } from 'georedis'

export interface XpUpdate {
  level: number
  current: number
  start: number
  goal: number
}

export type LoginRequest = {
  idToken: string
}

export type NearbyEntity = NearbyDC & {
  awardedAt?: number
}

export type NearbyEntities = {
  nearby: NearbyEntity[]
}

export type PositionUpdate = {
  latitude: number
  longitude: number
}

export type Session = {
  uid: string
}

export enum MessageTypes {
  Login = 1,
  Session = 2,
  NearbyEntities = 3,
  PositionUpdate = 4,
  XpUpdate = 5,
}

export type AnyMessage = LoginRequest | Session | PositionUpdate | NearbyEntities | XpUpdate
