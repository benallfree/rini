import React, { FC } from 'react'
import { ThemeProvider } from 'react-native-elements'
import FlashMessage from 'react-native-flash-message'
import { Authenticated } from './Authenticated'
import { Engine } from './Engine'
import { GameRoot } from './GameRoot'
import { Located } from './Located'

export const Root: FC = () => {
  console.log('Render root')
  return (
    <ThemeProvider>
      <Authenticated>
        <Located>
          <Engine>
            <GameRoot />
          </Engine>
        </Located>
      </Authenticated>
      <FlashMessage position="bottom" />
    </ThemeProvider>
  )
}
