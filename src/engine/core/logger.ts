export enum LogType {
  Info = 'info',
  Debug = 'debug',
  Warn = 'warn',
  Error = 'error',
}

type AnyJson = boolean | number | string | null | JsonArray | JsonMap
interface JsonMap {
  [key: string]: AnyJson
}
// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface JsonArray extends Array<AnyJson> {}

export const createLogger = () => {
  const logs: { time: Date; type: LogType; message: string; data?: any }[] = []

  return {
    logs: () => [...logs],
    log: (message: string, data?: any) =>
      logs.push({ type: LogType.Info, time: new Date(), message, data }),
    debug: (message: string, data?: any) =>
      logs.push({ type: LogType.Debug, time: new Date(), message, data }),
    info: (message: string, data?: any) =>
      logs.push({ type: LogType.Info, time: new Date(), message, data }),
    error: (message: string, data?: any) =>
      logs.push({ type: LogType.Error, time: new Date(), message, data }),
    warn: (message: string, data?: any) =>
      logs.push({ type: LogType.Warn, time: new Date(), message, data }),
    clear: () => {
      logs.length = 0
    },
  }
}

const logger = createLogger()
const { info, debug, warn, error } = logger

export { info, debug, warn, error }
export { logger }
