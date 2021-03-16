import Constants from 'expo-constants'
import { fetchUpdateAsync, reloadAsync } from 'expo-updates'
import React, { FC, useState } from 'react'
import { Button, CheckBox, Text } from 'react-native-elements'
import { useBetaSettings } from '../../../hooks/store/useBetaSettings'
import { PaddedRow } from './PaddedRow'
import { SettingsSection } from './SettingsSection'

export const BetaSettings: FC = () => {
  const [{ showLocation, showDistances, isUpdateAvailable }, update] = useBetaSettings()
  const [isDownloading, setIsDownloading] = useState(false)

  const handleAppUpdate = () => {
    if (!isUpdateAvailable || isDownloading) return
    setIsDownloading(true)
    fetchUpdateAsync()
      .then((res) => {
        if (res.isNew) {
          return reloadAsync()
        }
      })
      .catch(console.error)
      .finally(() => {
        setIsDownloading(false)
      })
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
          <Button
            disabled={isDownloading}
            title={`Update available. Tap to reload.`}
            onPress={handleAppUpdate}
            loading={isDownloading}></Button>
        </PaddedRow>
      )}
    </SettingsSection>
  )
}
