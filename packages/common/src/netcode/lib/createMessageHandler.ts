import { Header, HEADER_LEN, MessageTypeValues, MessageWrapper, sb } from '.'
import { event } from '../../event'

export const createMessageHandler = () => {
  const dataBuf = sb()

  let currentHeader: Header | undefined

  const [onRawMessage, emitRawMessage] = event<MessageWrapper>()

  const handleSocketDataEvent = (data: Buffer) => {
    dataBuf.writeBuffer(data)
    if (!currentHeader) {
      if (dataBuf.length < HEADER_LEN) return // nothing to do yet
      currentHeader = {
        id: dataBuf.readUInt32BE(),
        refMessageId: dataBuf.readUInt32BE(),
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

  return { handleSocketDataEvent, onRawMessage }
}