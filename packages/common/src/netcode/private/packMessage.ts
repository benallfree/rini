import { SmartBuffer } from 'smart-buffer'
import { MessageTypes } from '.'

export let messageId = 1

export const packMessage = (
  type: MessageTypes,
  refMessageId: number,
  payload?: SmartBuffer
) => {
  const packet = new SmartBuffer()
  packet.writeUInt32BE(messageId++)
  packet.writeUInt32BE(refMessageId)
  packet.writeUInt8(type)
  packet.writeUInt16BE(payload?.length || 0)
  if (payload && payload.length > 0) {
    packet.writeBuffer(payload.toBuffer())
  }
  return packet.toBuffer()
}
