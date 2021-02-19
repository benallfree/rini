import { createTransportPacker } from './transport'

export { MessageWrapper } from './transport'
export const createNetcode = () => {
  const transport = createTransportPacker()

  return transport
}
