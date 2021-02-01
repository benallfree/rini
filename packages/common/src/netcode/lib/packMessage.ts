/* eslint-disable @typescript-eslint/ban-types */
import { SmartBuffer } from 'smart-buffer'
import { AnyMessage } from '../messages'
import { CertifiedMessage, MessageWrapper } from './MessageTypes'

export let messageId = 1

export const certifyMessage = <TMessage extends AnyMessage>(
  data: MessageWrapper<TMessage>
): CertifiedMessage<TMessage> => {
  const final: CertifiedMessage<TMessage> = {
    ...data,
    id: messageId++,
  }
  return final
}

export const packMessage = <TMessage extends AnyMessage>(
  data: CertifiedMessage<TMessage>
): Buffer => {
  const packet = new SmartBuffer()
  const payload = JSON.stringify(data)
  // console.log(payload.length)
  packet.writeUInt32BE(payload.length)
  // console.log(`wire send`, packet.toBuffer())
  packet.writeString(payload)
  // console.log(`wire send`, packet.toBuffer())
  return packet.toBuffer()
}

export const certifyAndPackMessage = <TMessage extends AnyMessage>(
  data: MessageWrapper<TMessage>
): Buffer => {
  const certified = certifyMessage(data)
  return packMessage(certified)
}
