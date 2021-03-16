import React, { FC, useEffect } from 'react'
import { debug } from '../../engine/core/logger'
import { engine } from '../engine'
import { useIsReady } from '../hooks/store/useIsReady'

export const Engine: FC = ({ children }) => {
  const isReady = useIsReady()
  useEffect(() => {
    engine.start().catch(console.error)
  }, [])

  debug(`Engine`)

  if (!isReady) return <></>
  return <>{children}</>
}
