export enum LogEventType {
  Info = 'info',
  Debug = 'debug',
  Warn = 'warn',
  Error = 'error',
  Clear = 'clear',
}

type AnyJson = boolean | number | string | null | JsonArray | JsonMap
interface JsonMap {
  [key: string]: AnyJson
}
// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface JsonArray extends Array<AnyJson> {}

export type LogEvent = { time: Date; type: LogEventType; payload?: unknown[] }
export type LogMiddlewareProvider = (event: LogEvent) => void

export type LoggerConfig = {
  maxLogs: number
}

export const createLogger = (config?: Partial<LoggerConfig>) => {
  const _config: LoggerConfig = {
    maxLogs: 1000,
    ...config,
  }
  const logs: LogEvent[] = []
  const middleware: LogMiddlewareProvider[] = []

  function log(type: LogEventType, args: unknown[]) {
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
    const msg: LogEvent = { type, time: new Date(), payload: serializedArgs }
    logs.push(msg)
    if (logs.length > _config.maxLogs) {
      logs.shift()
    }
    middleware.forEach((m) => m(msg))
  }

  return {
    logs: () => [...logs],
    debug: (...args: unknown[]) => log(LogEventType.Debug, args),
    info: (...args: unknown[]) => log(LogEventType.Info, args),
    error: (...args: unknown[]) => log(LogEventType.Error, args),
    warn: (...args: unknown[]) => log(LogEventType.Warn, args),
    clear: () => {
      logs.length = 0
      middleware.forEach((m) => m({ type: LogEventType.Clear, time: new Date() }))
    },
    use: (provider: LogMiddlewareProvider) => {
      middleware.push(provider)
    },
  }
}

export const consoleMiddleware: LogMiddlewareProvider = (event) => {
  const { payload } = event
  if (!payload) return
  const prefix = `[${event.type.toString().padStart(5)}]`
  const _payload = [prefix, ...payload]
  switch (event.type) {
    case LogEventType.Info:
    case LogEventType.Debug:
      return console.log(..._payload)
    case LogEventType.Warn:
      return console.warn(..._payload)
    case LogEventType.Error:
      return console.error(..._payload)
  }
}

const logger = createLogger()
const { info, debug, warn, error } = logger

export { info, debug, warn, error }
export { logger }
