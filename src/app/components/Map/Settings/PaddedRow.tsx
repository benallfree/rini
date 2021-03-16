import React, { FC } from 'react'
import { Row, RowProps } from 'react-native-easy-grid'

export const PaddedRow: FC<RowProps> = ({ children, ...props }) => {
  return (
    <Row {...props} style={Object.assign({}, { padding: 10 }, props.style)}>
      {children}
    </Row>
  )
}
