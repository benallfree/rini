import {
  Header,
  HEADER_LEN,
  MessageTypeValues,
  MessageWrapper,
  RemoteInfo,
  sb,
} from '.'
import { event } from '../../event'

export const msgBuf = sb()

export let currentHeader: Header | undefined

const [onRawMessage, emitRawMessage] = event<MessageWrapper>()

export const handleMessage = (msg: Buffer, rinfo: RemoteInfo) => {
  msgBuf.writeBuffer(msg)
  if (!currentHeader) {
    if (msgBuf.length < HEADER_LEN) return // nothing to do yet
    currentHeader = {
      id: msgBuf.readUInt32BE(),
      refMessageId: msgBuf.readUInt32BE(),
      address: rinfo.address,
      port: rinfo.port,
      type: msgBuf.readUInt8(),
      payloadLength: msgBuf.readUInt16BE(),
    }
    if (!currentHeader.id) {
      throw new Error(`Unexpected message ID ${currentHeader.id}`)
    }
    if (!MessageTypeValues.includes(currentHeader.type)) {
      throw new Error(`Unexpected message type ${currentHeader.type}`)
    }
  }
  if (currentHeader) {
    if (msgBuf.length < currentHeader.payloadLength) return // nothing to do yet
    const e: MessageWrapper = {
      ...currentHeader,
      payload: msgBuf.readBuffer(currentHeader.payloadLength),
    }
    emitRawMessage(e)
    currentHeader = undefined
  }
}

export { onRawMessage }
