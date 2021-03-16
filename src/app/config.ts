import { isDevice } from 'expo-device'

export const BETA_MODE = __DEV__ && !isDevice
