import { map } from '@s-libs/micro-dash'
import React, { FC } from 'react'
import { Button, Text } from 'react-native-elements'
import { useAppDispatch } from '../../../hooks/store/useAppDispatch'
import { useAppSelector } from '../../../hooks/store/useAppSelector'
import { PaddedRow } from './PaddedRow'
import { SettingsSection } from './SettingsSection'

export const useLogs = () => {
  return useAppSelector((state) => state.game.logs)
}

export const Diagnostics: FC = () => {
  const logs = useLogs()
  const { clearLogs } = useAppDispatch()
  return (
    <SettingsSection title="Diagnostics">
      <PaddedRow>
        <Button
          title={`Clear logs`}
          onPress={() => {
            clearLogs()
          }}></Button>
      </PaddedRow>
      {map([...logs].reverse(), (log, i) => {
        return (
          <PaddedRow key={i} style={{ flexWrap: 'wrap' }}>
            <Text>{JSON.stringify(log.payload)}</Text>
          </PaddedRow>
        )
      })}
    </SettingsSection>
  )
}
