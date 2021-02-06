import { BufferList } from 'bl'
import { event } from '../../event'
import { AnyMessage } from '../messages'
import {
  MAGIC_SIZE,
  MessageWrapper,
  START_SENTINAL_SIZE,
  TransportPacker,
} from './transport'

export const createMessageHandler = (transport: TransportPacker) => {
  const dataBuf = new BufferList()

  const [onRawMessage, emitRawMessage] = event<MessageWrapper<AnyMessage>>()

  const fastForwardToMagic = () => {
    if (dataBuf.length === 0) return
    // Find magic start
    let offset = 0
    while (offset <= dataBuf.length - MAGIC_SIZE) {
      if (transport.isMessageStart(dataBuf, offset)) {
        dataBuf.consume(offset)
        return
      }
      offset++
    }
    dataBuf.consume(offset)
  }

  const handleSocketDataEvent = (
    data: Buffer
  ): MessageWrapper<AnyMessage> | void => {
    dataBuf.append(data)
    fastForwardToMagic()
    console.log('mem used', dataBuf.length)
    if (dataBuf.length < START_SENTINAL_SIZE) return // If it doens't have magic + length, there is nothing to do yet
    const streamLen = dataBuf.readUInt16BE(MAGIC_SIZE)
    if (dataBuf.length < streamLen) return
    const unpacked = transport.unpack(dataBuf.slice(0, streamLen))
    dataBuf.consume(streamLen)
    emitRawMessage(unpacked)
    return unpacked
  }

  return { handleSocketDataEvent, onRawMessage }
}
