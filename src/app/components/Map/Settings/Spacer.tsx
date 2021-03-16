import React, { FC } from 'react'
import { View } from 'react-native'
import { Row } from 'react-native-easy-grid'

export const Spacer: FC<{ height?: number }> = ({ height = 10 }) => (
  <Row>
    <View style={{ height, width: '100%' }} />
  </Row>
)
