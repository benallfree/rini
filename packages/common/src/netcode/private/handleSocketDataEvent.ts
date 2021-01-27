import {
  Header,
  HEADER_LEN,
  MessageTypeValues,
  MessageWrapper,
  RemoteInfo,
  sb,
} from '.'
import { event } from '../../event'

export const dataBuf = sb()

export let currentHeader: Header | undefined

const [onRawMessage, emitRawMessage] = event<MessageWrapper>()

export const handleSocketDataEvent = (data: Buffer, rinfo: RemoteInfo) => {
  console.log(`Data event`, data)
  dataBuf.writeBuffer(data)
  if (!currentHeader) {
    if (dataBuf.length < HEADER_LEN) return // nothing to do yet
    currentHeader = {
      id: dataBuf.readUInt32BE(),
      refMessageId: dataBuf.readUInt32BE(),
      address: rinfo.address,
      port: rinfo.port,
      type: dataBuf.readUInt8(),
      payloadLength: dataBuf.readUInt16BE(),
    }
    if (!currentHeader.id) {
      throw new Error(`Unexpected message ID ${currentHeader.id}`)
    }
    if (!MessageTypeValues.includes(currentHeader.type)) {
      throw new Error(`Unexpected message type ${currentHeader.type}`)
    }
  }
  if (currentHeader) {
    if (dataBuf.length < currentHeader.payloadLength) return // nothing to do yet
    const e: MessageWrapper = {
      ...currentHeader,
      payload: dataBuf.readBuffer(currentHeader.payloadLength),
    }
    emitRawMessage(e)
    currentHeader = undefined
  }
}

export { onRawMessage }
