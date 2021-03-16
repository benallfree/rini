import * as Device from 'expo-device'
import { checkForUpdateAsync } from 'expo-updates'
import React, { FC, useEffect } from 'react'
import { engine } from '../engine'
import { useBetaSettings } from '../hooks/store/useBetaSettings'
import { useIsReady } from '../hooks/store/useIsReady'

export const Engine: FC = ({ children }) => {
  const isReady = useIsReady()
  const [, update] = useBetaSettings()
  useEffect(() => {
    engine.start().catch(console.error)

    const checkUpdate = () => {
      if (!Device.isDevice || __DEV__) return
      checkForUpdateAsync()
        .then((value) => {
          update({ isUpdateAvailable: value.isAvailable })
        })
        .catch(console.error)
        .finally(() => {
          setTimeout(checkUpdate, 30000) // check every 30s
        })
    }
    checkUpdate()
  }, [])
  if (!isReady) return <></>
  return <>{children}</>
}
