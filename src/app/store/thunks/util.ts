import { RootState } from '..'

export const getState = (thunkApi: any) => thunkApi.getState() as RootState
export const makeLiveState = (thunkApi: any) => {
  return {
    currentLocation() {
      const { location } = getState(thunkApi).profile
      if (!location) throw new Error(`Current location should always be available here`)
      return location
    },
    uid() {
      const { uid } = getState(thunkApi).session.tokens
      if (!uid) throw new Error(`UID should always be defined here`)
      return uid
    },
  }
}
