import React, { FC, useEffect } from 'react'
import { engine } from '../engine'
import { db } from '../firebase'

export const InternetCheck: FC = ({ children }) => {
  useEffect(() => {
    const connectedRef = db.ref('.info/connected')
    connectedRef.on('value', (snap) => {
      engine.onlineStatusChanged(!!snap.val())
    })
  }, [])
  return <>{children}</>
}
