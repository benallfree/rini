declare module 'react-native-pulse' {
  import { Component } from 'react'
  import { ImageSourcePropType, StyleProp } from 'react-native'

  export interface Props {
    color: string
    diameter: number
    duration: number
    image: ImageSourcePropType | null
    initialDiameter: number
    numPulses: number
    pulseStyle: StyleProp
    speed: number
  }

  class Pulse extends Component<Props> {
    static defaultProps: Props
  }

  // let Pulse:any
  export default Pulse
}
