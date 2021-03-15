import { useAppSelector } from './useAppSelector'

export const usePlayerMovement = () => {
  const latitude = useAppSelector((state) => state.game.player.movement?.latitude) as number
  const longitude = useAppSelector((state) => state.game.player.movement?.longitude) as number
  const heading = useAppSelector((state) => state.game.player.movement?.heading) as number
  return { latitude, longitude, heading }
}
