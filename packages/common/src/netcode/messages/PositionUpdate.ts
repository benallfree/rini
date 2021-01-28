import { SmartBuffer } from 'smart-buffer'
import { ClientMessageSender } from '../createClientNetcode'
import { MessageTypes, MessageWrapper } from '../private'
import { packMessage } from '../private/packMessage'
import { sendMessageAndForget } from '../private/sendMessageAndForget'

export type PositionUpdateRequest = {
  latitude: number
  longitude: number
}

export type PositionUpdateResponse = {
  tid: number
}

const packRequest = (msg: PositionUpdateRequest): Buffer => {
  const payload = new SmartBuffer()
  payload.writeFloatBE(msg.latitude)
  payload.writeFloatBE(msg.longitude)
  return packMessage(MessageTypes.PositionUpdateRequest, 0, payload)
}

const unpackRequest = (wrapper: MessageWrapper): PositionUpdateRequest => {
  const msg: PositionUpdateRequest = {
    latitude: wrapper.payload.readFloatBE(),
    longitude: wrapper.payload.readFloatBE(),
  }
  return msg
}

const packResponse = (
  wrapper: MessageWrapper,
  msg: PositionUpdateResponse
): Buffer => {
  const payload = new SmartBuffer()
  payload.writeUInt32BE(msg.tid)
  return packMessage(MessageTypes.PositionUpdateResponse, wrapper.id, payload)
}

const unpackResponse = (wrapper: MessageWrapper): PositionUpdateResponse => {
  const msg: PositionUpdateResponse = {
    tid: wrapper.payload.readUInt32BE(),
  }
  return msg
}

export const sendPositionUpdateRequest = async (
  msg: PositionUpdateRequest,
  send: ClientMessageSender
): Promise<void> => {
  const packed = packRequest(msg)
  const wrapper = await sendMessageAndForget(packed, send)
}
