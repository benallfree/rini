import { createContainer } from 'unstated-next'
import { useAuthSlice } from './useAuthSlice'
import { useNetSlice } from './useNetSlice'

const useStoreBase = () => {
  const authSlice = useAuthSlice()
  const netSlice = useNetSlice(authSlice)

  return {
    auth: authSlice,
    net: netSlice,
  }
}

const Store = createContainer(useStoreBase)

export const useStore = () => {
  return Store.useContainer()
}

export const useAuth = () => useStore().auth
export const useNet = () => useStore().net

export { Store }
