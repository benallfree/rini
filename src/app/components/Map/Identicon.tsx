import React, { FC, useEffect, useMemo, useState } from 'react'
import { SvgFromXml } from 'react-native-svg'

export const IDENTICON_STYLES = {
  male: 'Male',
  female: 'Female',
  human: 'Person',
  bottts: 'Robot',
  avataaars: 'Avatar',
  identicon: 'Symbol',
  gridy: 'Mask',
}

export type IdenticonKey = keyof typeof IDENTICON_STYLES

const fetchCache: { [uri: string]: string } = {}

export const Identicon: FC<{
  value: string
  size?: number
  type?: IdenticonKey
}> = ({ value, size = 180, type = 'bottts' }) => {
  const uri = `https://avatars.dicebear.com/api/${type}/${value}.svg`
  const [data, setData] = useState(fetchCache[uri] ?? '')
  useEffect(() => {
    if (fetchCache[uri]) return
    fetch(uri)
      .then((response) => response.text())
      .then((data) => data.replace(/\s*undefined\s*/, ''))
      .then((data) => {
        fetchCache[uri] = data
        setData(data)
      })
      .catch(console.error)
  }, [setData, uri])
  return useMemo(() => <SvgFromXml height={size} width={size} xml={data} />, [size, data])
}
