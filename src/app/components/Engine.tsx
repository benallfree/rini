import React, { FC, useEffect } from 'react'
import { engine } from '../engine'
import { useIsReady } from '../hooks/hooks'

export const Engine: FC = ({ children }) => {
  const isReady = useIsReady()
  useEffect(() => {
    engine.start().catch(console.error)
  }, [])
  if (!isReady) return <></>
  return <>{children}</>
}
