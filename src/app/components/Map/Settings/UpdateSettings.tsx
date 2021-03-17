import Constants from 'expo-constants'
import { fetchUpdateAsync, reloadAsync } from 'expo-updates'
import React, { FC, useState } from 'react'
import { Button, Text } from 'react-native-elements'
import { useBetaSettings } from '../../../hooks/store/useBetaSettings'
import { useIsBeta } from '../../../hooks/store/useIsBeta'
import { PaddedRow } from './PaddedRow'
import { SettingsSection } from './SettingsSection'

export const UpdateSettings: FC = () => {
  const [{ isUpdateAvailable }] = useBetaSettings()
  const isBeta = useIsBeta()
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
    <SettingsSection title="Update">
      {isBeta && (
        <PaddedRow>
          <Text>Version: {Constants.manifest.releaseId ?? 'Development Mode'}</Text>
        </PaddedRow>
      )}

      <PaddedRow>
        {isUpdateAvailable && (
          <Button
            disabled={isDownloading}
            title={`Update available. Tap to reload.`}
            onPress={handleAppUpdate}
            loading={isDownloading}></Button>
        )}
        {!isUpdateAvailable && <Text>You are running the latest version of Rini.</Text>}
      </PaddedRow>
    </SettingsSection>
  )
}
