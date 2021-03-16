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

export type LogMessage = { time: Date; type: LogType; args: unknown[] }
export type LogMiddlewareProvider = (msg: LogMessage) => void

export type LoggerConfig = {
  maxLogs: number
}

export const createLogger = (config?: Partial<LoggerConfig>) => {
  const _config: LoggerConfig = {
    maxLogs: 1000,
    ...config,
  }
  const logs: LogMessage[] = []
  const middleware: LogMiddlewareProvider[] = []

  function log(type: LogType, args: unknown[]) {
    const serializedArgs = ((): unknown[] | undefined => {
      try {
        return JSON.parse(JSON.stringify(args)) as unknown[]
      } catch (e) {
        return undefined
      }
    })()
    if (!serializedArgs) {
      console.error(`Not serializable`, args)
      throw new Error(`Not serializable`)
    }
    const msg: LogMessage = { type, time: new Date(), args: serializedArgs }
    logs.push(msg)
    if (logs.length > _config.maxLogs) {
      logs.shift()
    }
    middleware.forEach((m) => m(msg))
  }

  return {
    logs: () => [...logs],
    debug: (...args: unknown[]) => log(LogType.Debug, args),
    info: (...args: unknown[]) => log(LogType.Info, args),
    error: (...args: unknown[]) => log(LogType.Error, args),
    warn: (...args: unknown[]) => log(LogType.Warn, args),
    clear: () => {
      logs.length = 0
    },
    use: (provider: LogMiddlewareProvider) => {
      middleware.push(provider)
    },
  }
}

export const consoleMiddleware: LogMiddlewareProvider = (msg) => {
  switch (msg.type) {
    case LogType.Info:
    case LogType.Debug:
      return console.log(...msg.args)
    case LogType.Warn:
      return console.warn(...msg.args)
    case LogType.Error:
      return console.error(...msg.args)
  }
}

const logger = createLogger()
const { info, debug, warn, error } = logger

export { info, debug, warn, error }
export { logger }
