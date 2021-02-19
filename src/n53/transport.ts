import { AnyMessage, MessageTypes } from '../common'

export type TransportPackerConfig = {}

export type MessageHeader = {
  id: number
  refId: number
  type: MessageTypes
}

export type MessageWrapper<
  TMessage extends AnyMessage = AnyMessage
> = MessageHeader & {
  message: TMessage
}

export const createTransportPacker = (
  config?: Partial<TransportPackerConfig>
) => {
  let messageId = 0

  const pack = <TMessage extends AnyMessage>(
    type: MessageTypes,
    message: TMessage,
    refId = 0
  ): [string, MessageWrapper<TMessage>] => {
    type ThisMessageWrapper = MessageWrapper<TMessage>

    const wrapper: ThisMessageWrapper = {
      id: messageId++,
      refId,
      type: type as number,
      message,
    }

    const packed = JSON.stringify(wrapper)
    return [packed, wrapper]
  }

  const unpack = <TMessage extends AnyMessage>(packed: string) => {
    type ThisMessageWrapper = MessageWrapper<TMessage>
    const wrapper = (() => {
      try {
        const data = JSON.parse(packed)
        if (!('id' in data)) {
          throw new Error(
            `Invalid parsed packet format ${JSON.stringify(data)} (${packed})`
          )
        }
        return data as ThisMessageWrapper
      } catch (e) {
        throw new Error(`Parse failed for ${packed}, ${e}`)
      }
    })()

    return wrapper
  }

  return {
    pack,
    unpack,
  }
}
