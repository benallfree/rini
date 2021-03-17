import React, { FC } from 'react'
import { CheckBox } from 'react-native-elements'
import { useBetaSettings } from '../../../hooks/store/useBetaSettings'
import { SettingsSection } from './SettingsSection'

export const BetaSettings: FC = () => {
  const [{ showLocation, showDistances }, update] = useBetaSettings()

  return (
    <SettingsSection title="Beta">
      <CheckBox
        title="Show location & heading"
        checked={showLocation}
        onPress={() => update({ showLocation: !showLocation })}
      />
      <CheckBox
        title="Show entity distances"
        checked={showDistances}
        onPress={() => update({ showDistances: !showDistances })}
      />
    </SettingsSection>
  )
}
