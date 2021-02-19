import { createNodeSocketProvider } from './node-socket'

export type SocketProvider = ReturnType<typeof createNodeSocketProvider>
