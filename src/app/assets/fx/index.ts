import { Asset } from 'expo-asset'
import { Audio } from 'expo-av'

const mksnd = (asset: Asset) => {
  return {
    play: () =>
      Audio.Sound.createAsync(asset).then(({ sound }) => {
        console.log(`Playing sound ${asset.hash}`)

        return sound.playAsync()
      }),
  }
}

export const fx = {
  chime: mksnd(require(`./compressed/405546__raclure__loading-chime.m4a`)),
  suck: mksnd(require(`./compressed/81152__joedeshon__suck-pop-03.m4a`)),
  point: mksnd(require(`./compressed/523649__matrixxx__powerup-07.m4a`)),
}
