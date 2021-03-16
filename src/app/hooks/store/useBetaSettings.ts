import { Settings } from '../../../engine/redux/gameSlice'
import { useAppDispatch } from './useAppDispatch'
import { useSettings } from './useSettings'

export const useBetaSettings = (): [
  Settings['beta'],
  (beta: Partial<Settings['beta']>) => void
] => {
  const settings = useSettings()
  const { settingsUpdated } = useAppDispatch()
  const { beta } = settings
  return [
    beta,
    (beta: Partial<Settings['beta']>) => {
      settingsUpdated({ ...settings, beta: { ...settings.beta, ...beta } })
    },
  ]
}
