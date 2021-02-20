import React, { FC, useEffect } from 'react'
import { useWebWorker } from '../rn-webworker'
import workerJs from './worker.inlined'

export const Worker: FC = ({ children }) => {
  const { WebWorker, send, onMessage } = useWebWorker(workerJs)

  useEffect(() => {
    return onMessage((msg) => {
      console.log(msg)
    })
  }, [])

  return <WebWorker />
}
