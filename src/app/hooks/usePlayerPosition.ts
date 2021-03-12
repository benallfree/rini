import { useAppSelector } from './useAppSelector'

export const usePlayerPosition = () => {
  const latitude = useAppSelector((state) => state.game.player.position?.latitude) as number
  const longitude = useAppSelector((state) => state.game.player.position?.longitude) as number
  const heading = useAppSelector((state) => state.game.player.position?.heading) as number
  return { latitude, longitude, heading }
}
