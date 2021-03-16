import { Settings } from '../../../engine/redux/gameSlice'
import { useAppSelector } from './useAppSelector'

export const useSettings = (): Settings => {
  return useAppSelector((state) => state.game.settings)
}
