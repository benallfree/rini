import React, { FC } from 'react'
import { ThemeProvider } from 'react-native-elements'
import { Authenticated } from './Authenticated'
import { AuthenticatedRoot } from './AuthenticatedRoot'
import { Located } from './Located'

export const Root: FC = () => {
  return (
    <ThemeProvider>
      <Located>
        <Authenticated>
          <AuthenticatedRoot />
        </Authenticated>
      </Located>
    </ThemeProvider>
  )
}