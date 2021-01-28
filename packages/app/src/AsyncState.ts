export type AsyncState<TData> = {
  promised: boolean
  data?: TData
  error?: Error
}
