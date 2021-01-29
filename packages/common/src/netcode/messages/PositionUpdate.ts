import { SmartBuffer } from 'smart-buffer'
import { MessageWrapper } from '../lib'
import { MessageTypes } from '../lib/MessageTypes'
import { packMessage } from '../lib/packMessage'

export type PositionUpdateRequest = {
  latitude: number
  longitude: number
}

export type PositionUpdateResponse = {
  tid: number
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
  payload.writeUInt32BE(msg.tid)
  return packMessage(MessageTypes.PositionUpdateResponse, wrapper.id, payload)
}

export const unpackPositionUpdateResponse = (
  wrapper: MessageWrapper
): PositionUpdateResponse => {
  const msg: PositionUpdateResponse = {
    tid: wrapper.payload.readUInt32BE(),
  }
  return msg
}
