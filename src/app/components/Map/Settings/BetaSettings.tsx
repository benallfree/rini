import Constants from 'expo-constants'
import { reloadAsync } from 'expo-updates'
import React, { FC } from 'react'
import { Button, CheckBox, Text } from 'react-native-elements'
import { useBetaSettings } from '../../../hooks/store/useBetaSettings'
import { PaddedRow } from './PaddedRow'
import { SettingsSection } from './SettingsSection'

export const BetaSettings: FC = () => {
  const [{ showLocation, showDistances, isUpdateAvailable }, update] = useBetaSettings()

  const handleAppUpdate = () => {
    if (!isUpdateAvailable) return
    reloadAsync().catch(console.error)
  }

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
      <PaddedRow>
        <Text>Revision: {Constants.manifest.releaseId ?? 'Development Mode'}</Text>
      </PaddedRow>

      {isUpdateAvailable && (
        <PaddedRow>
          <Button title={`Update available. Tap to reload.`} onPress={handleAppUpdate}></Button>
        </PaddedRow>
      )}
    </SettingsSection>
  )
}
