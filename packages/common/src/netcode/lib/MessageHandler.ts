import { SmartBuffer } from 'smart-buffer'
import { event } from '../../event'
import { AnyMessage } from '../messages'
import { CertifiedMessage } from './MessageTypes'

export const createMessageHandler = () => {
  let dataBuf = new SmartBuffer()

  const [onRawMessage, emitRawMessage] = event<CertifiedMessage<AnyMessage>>()

  const handleSocketDataEvent = (data: Buffer) => {
    dataBuf.writeBuffer(data)
    const msgLen = dataBuf.internalBuffer.readUInt32BE(dataBuf.readOffset)
    // console.log(`wire in`, { data, msgLen })

    if (dataBuf.length < msgLen + 4) return
    dataBuf.readUInt32BE() // throw away
    const jsonString = dataBuf.readBuffer(msgLen).toString()
    const tmp = dataBuf.internalBuffer.slice(
      dataBuf.readOffset,
      dataBuf.readOffset + dataBuf.length
    )
    dataBuf = SmartBuffer.fromBuffer(tmp)
    console.log('mem used', dataBuf.internalBuffer.length)
    // console.log(`final message in`, { msg })

    try {
      const msg: CertifiedMessage<AnyMessage> = JSON.parse(jsonString)
      emitRawMessage(msg)
    } catch (e) {
      console.error(`Error parsing JSON message`, jsonString)
    }
  }

  return { handleSocketDataEvent, onRawMessage }
}
