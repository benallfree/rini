import React, { FC } from 'react'
import { View } from 'react-native'
import { Col, Grid, Row } from 'react-native-easy-grid'
import { Text } from 'react-native-elements'

export const SettingsSection: FC<{ title: string }> = ({ title, children }) => {
  return (
    <Grid>
      <Row
        style={{
          height: 30,
          borderTopColor: 'black',
          borderTopWidth: 1,
        }}>
        <View
          style={{
            position: 'absolute',
            width: 150,
            height: '100%',
            borderBottomRightRadius: 30,
            backgroundColor: 'orange',
            opacity: 0.8,
          }}></View>
        <View
          style={{
            position: 'absolute',
            width: 150,
            height: 30,
            borderBottomRightRadius: 30,
            borderColor: 'black',
            borderRightWidth: 1,
            paddingLeft: 10,
            borderBottomWidth: 1,
          }}></View>
        <Col style={{ marginLeft: 15 }}>
          <Text h4>{title}</Text>
        </Col>
      </Row>
      <Row>{children}</Row>
    </Grid>
  )
}
