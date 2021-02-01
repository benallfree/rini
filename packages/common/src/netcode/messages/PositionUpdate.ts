import { SmartBuffer } from 'smart-buffer'
import { NearbyDC } from 'georedis'
import { MessageWrapper } from '../lib'
import { MessageTypes } from '../lib/MessageTypes'
import { packMessage } from '../lib/packMessage'

export type PositionUpdateRequest = {
  latitude: number
  longitude: number
}

export type PositionUpdateResponse = {
  nearby: NearbyDC[]
}

export const packPositionUpdateRequest = (
  msg: PositionUpdateRequest
): Buffer => {
  const payload = new SmartBuffer()
  payload.writeFloatBE(msg.latitude)
  payload.writeFloatBE(msg.longitude)
  return packMessage(MessageTypes.PositionUpdateRequest, 0, payload)
}

export const unpackPositionUpdateRequest = (
  wrapper: MessageWrapper
): PositionUpdateRequest => {
  const msg: PositionUpdateRequest = {
    latitude: wrapper.payload.readFloatBE(),
    longitude: wrapper.payload.readFloatBE(),
  }
  return msg
}

export const packPositionUpdateResponse = (
  wrapper: MessageWrapper,
  msg: PositionUpdateResponse
): Buffer => {
  const payload = new SmartBuffer()
  payload.writeUInt32BE(msg.nearby.length)
  msg.nearby.forEach((player) => {
    payload.writeStringNT(player.key)
    payload.writeFloatBE(player.latitude)
    payload.writeFloatBE(player.longitude)
    payload.writeFloatBE(player.distance)
  })
  return packMessage(MessageTypes.PositionUpdateResponse, wrapper.id, payload)
}

export const unpackPositionUpdateResponse = (
  wrapper: MessageWrapper
): PositionUpdateResponse => {
  const nearby: NearbyDC[] = []
  const { payload } = wrapper
  const playerCount = payload.readUInt32BE()
  for (let i = 0; i < playerCount; i++) {
    nearby.push({
      key: payload.readStringNT(),
      latitude: payload.readFloatBE(),
      longitude: payload.readFloatBE(),
      distance: payload.readFloatBE(),
    })
  }
  const msg: PositionUpdateResponse = {
    nearby,
  }
  return msg
}
