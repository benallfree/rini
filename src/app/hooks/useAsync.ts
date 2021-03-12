import { useCallback, useState } from 'react'

export const useAsync = <TData extends any>() => {
  const [state, setState] = useState<{ data?: TData; error?: Error; isPending: boolean }>({
    isPending: true,
  })
  const setData = useCallback((data: TData) => setState({ data, isPending: false }), [])
  const setError = useCallback((error: Error) => {
    setState({ error, isPending: false })
  }, [])
  return {
    ...state,
    setData,
    setError,
  }
}
