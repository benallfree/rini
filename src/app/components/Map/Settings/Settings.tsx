import React, { FC, useRef, useState } from 'react'
import { Dimensions, View } from 'react-native'
import { Grid, Row } from 'react-native-easy-grid'
import { Badge, Icon, Overlay, Text } from 'react-native-elements'
import { useBetaSettings } from '../../../hooks/store/useBetaSettings'
import { BetaSettings } from './BetaSettings'

export const Settings: FC<{
  size?: number
}> = ({ size = 50 }) => {
  const [{ isUpdateAvailable }] = useBetaSettings()
  const [isVisible, setVisible] = useState(false)
  const overlayRef = useRef<Overlay>(null)
  const iconSize = size * 0.5
  const leftTop = (size - iconSize) / 2
  return (
    <View style={{ width: size, height: size }}>
      <Overlay
        ref={overlayRef}
        isVisible={isVisible}
        onBackdropPress={() => setVisible(false)}
        backdropStyle={{ backgroundColor: 'orange', opacity: 0.4 }}
        fullScreen
        overlayStyle={{
          position: 'absolute',
          marginTop: 50,
          left: 10,
          right: 10,
          height: Dimensions.get('screen').height - 60,
          width: Dimensions.get('screen').width - 20,
          bottom: 10,
          backgroundColor: 'white',
          borderRadius: 30,
          padding: 0,
          paddingTop: 10,
          margin: 0,
        }}>
        <Grid>
          <Row style={{ height: 50, marginBottom: 10 }}>
            <Text h3 style={{ textAlign: 'center', top: 5, width: '100%' }}>
              Settings
            </Text>
            <View style={{ position: 'absolute', right: 10, top: 0, zIndex: 9999 }}>
              <Icon
                type="font-awesome-5"
                name="times-circle"
                onPress={() => setVisible(false)}
                size={50}
              />
            </View>
          </Row>
          <Row>
            <BetaSettings />
          </Row>
        </Grid>
      </Overlay>
      <View
        style={{
          opacity: 0.4,
          borderRadius: size / 2,
          width: size,
          height: size,
        }}></View>
      <View style={{ position: 'absolute', top: leftTop, left: leftTop - 1 }}>
        <Icon type="font-awesome-5" name="cog" onPress={() => setVisible(true)} size={iconSize} />
        {isUpdateAvailable && (
          <Badge
            status="error"
            value="1"
            containerStyle={{ position: 'absolute', left: 15, top: -5 }}
          />
        )}
      </View>
    </View>
  )
}
