import { Picker } from '@react-native-picker/picker'
import { map } from '@s-libs/micro-dash'
import React, { FC } from 'react'
import { View } from 'react-native'
import { Col, Row } from 'react-native-easy-grid'
import { Button, Text } from 'react-native-elements'
import { IdenticonKey, IDENTICON_STYLES } from '../Identicon'
import { SettingsSection } from './SettingsSection'
import { Spacer } from './Spacer'
import { useAvatar } from './useAvatar'

export const AvatarSettings: FC = () => {
  const { Avatar, setType, type, recycle } = useAvatar(128)
  console.log('rendering avatar')
  return (
    <SettingsSection title="I am a...">
      <Row>
        <Col style={{ height: 250, padding: 10 }}>
          <Row
            style={{
              marginLeft: 'auto',
              marginRight: 'auto',
              width: 128,
              height: 128,
            }}>
            <Avatar />
          </Row>
          <Spacer />
          <Text>{`Every avatar is unique and you'll never see it again after recycling.`}</Text>
          <Spacer />
          <Button onPress={recycle} title="Recycle" />
        </Col>
        <Col>
          <View style={{ width: 150, height: 200, marginTop: 20 }}>
            <View style={{ zIndex: 0, height: 150 }}>
              <Picker
                selectedValue={type}
                onValueChange={(itemValue, itemIndex) => {
                  console.log({ itemValue })
                  return setType(itemValue.toString() as IdenticonKey)
                }}>
                {map(IDENTICON_STYLES, (v, k) => (
                  <Picker.Item key={k} label={v} value={k} />
                ))}
              </Picker>
            </View>
          </View>
        </Col>
      </Row>
    </SettingsSection>
  )
}
