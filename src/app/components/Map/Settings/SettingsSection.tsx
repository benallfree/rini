import React, { FC } from 'react'
import { View } from 'react-native'
import { Col, Grid, Row } from 'react-native-easy-grid'
import { Text } from 'react-native-elements'

export const SettingsSection: FC<{ title: string }> = ({ title, children }) => {
  const titleWidth = 300
  const titleHeight = 40
  const titleRadius = titleHeight / 2
  return (
    <Grid>
      <Row
        style={{
          height: titleHeight,
          borderTopColor: 'black',
          borderTopWidth: 1,
        }}>
        <View
          style={{
            position: 'absolute',
            width: titleWidth,
            height: '100%',
            borderBottomRightRadius: titleRadius,
            backgroundColor: 'orange',
            opacity: 0.8,
          }}></View>
        <View
          style={{
            position: 'absolute',
            width: titleWidth,
            height: titleHeight,
            borderBottomRightRadius: titleRadius,
            borderColor: 'black',
            borderRightWidth: 1,
            paddingLeft: 10,
            borderBottomWidth: 1,
          }}></View>
        <Col style={{ marginLeft: 15 }}>
          <Text h4>{title}</Text>
        </Col>
      </Row>
      <Row>
        <Col>{children}</Col>
      </Row>
    </Grid>
  )
}
