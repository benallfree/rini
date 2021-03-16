import { useCallback } from 'react'
import { logger } from '../../../engine/core/logger'
import { Settings } from '../../../engine/redux/gameSlice'
import { useAppDispatch } from './useAppDispatch'
import { useSettings } from './useSettings'

const { debug } = logger
export const useBetaSettings = (): [
  Settings['beta'],
  (beta: Partial<Settings['beta']>) => void
] => {
  const settings = useSettings()
  const { settingsUpdated } = useAppDispatch()
  const { beta } = settings
  const update = useCallback(
    (beta: Partial<Settings['beta']>) => {
      // debug(`update has been called `, beta)
      settingsUpdated({ ...settings, beta: { ...settings.beta, ...beta } })
    },
    [settings, settingsUpdated]
  )

  return [beta, update]
}
