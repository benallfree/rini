import { useEffect } from 'react'
import { smartTextFetch } from '../smartFetch'
import { useAsync } from './useAsync'

export const useSmartTextFetch = (uri: string) => {
  const { data, error, isPending, setData, setError } = useAsync<string>()
  useEffect(() => {
    smartTextFetch(uri).then(setData).catch(setError)
  }, [setData, setError, uri])
  return {
    text: data,
    error,
    isPending,
  }
}
