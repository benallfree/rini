import { BufferList } from 'bl'
import { event } from '../../event'
import { AnyMessage } from '../messages'
import { MessageWrapper, unpack } from './transport'

export const createMessageHandler = () => {
  const dataBuf = new BufferList()

  const [onRawMessage, emitRawMessage] = event<MessageWrapper<AnyMessage>>()

  const handleSocketDataEvent = (data: Buffer) => {
    dataBuf.append(data)
    if (dataBuf.length < 2) return
    const msgLen = dataBuf.readUInt16BE()
    const streamLen = msgLen + 2
    if (dataBuf.length < streamLen) return
    const unpacked = unpack(dataBuf.slice(0, streamLen))
    dataBuf.consume(streamLen)
    console.log('mem used', dataBuf.length)

    emitRawMessage(unpacked)
  }

  return { handleSocketDataEvent, onRawMessage }
}
