import React, { FC, useEffect, useMemo, useState } from 'react'
import { SvgFromXml } from 'react-native-svg'
import { DEFAULT_AVATAR_SVG } from '../../../engine/redux/DEFAULT_AVATAR'
import { EntityId } from '../../../engine/storage/Database'
import { useAvatarUri } from '../../hooks/store/useAvatarUri'
import { smartTextFetch } from '../../smartFetch'

export const Avatar: FC<{ id: EntityId; size: number }> = ({ id, size }) => {
  const uri = useAvatarUri(id)
  const [svg, setSvg] = useState<string>()

  useEffect(() => {
    if (!uri) return
    smartTextFetch(uri)
      .then(setSvg)
      .catch((e) => {
        console.error(e)
        setSvg(DEFAULT_AVATAR_SVG)
      })
  }, [uri])

  return useMemo(() => {
    if (!svg) return null
    // console.log('Avatar', { svg, size })
    return <SvgFromXml height={size} width={size} xml={svg.replace(/undefined/, '')} />
  }, [size, svg])
}
