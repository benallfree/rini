import React, { FC, useCallback, useEffect, useState } from 'react'
import { Button, Text } from 'react-native-elements'
import { check, PERMISSIONS, request } from 'react-native-permissions'
import { PermissionCheckStatus } from './App'

const permissions = [
  {
    title:
      'Rini would like to use your location to say hi to other Tesla drivers.',
    permission: PERMISSIONS.IOS.LOCATION_ALWAYS,
  },
]
export const EnsureLocationPermission: FC = ({ children }) => {
  const [
    permissionCheckResult,
    setPermissionCheckResult,
  ] = useState<PermissionCheckStatus>()
  const [step, setStep] = useState(0)

  const checkPermission = useCallback(() => {
    if (!permissions[step]) return // got to the end
    check(permissions[step].permission)
      .then((result) => {
        if (result === 'granted') {
          setStep(step + 1)
          return
        }
        setPermissionCheckResult(result)
      })
      .catch((error) => {
        console.error(error)
      })
  }, [step])

  useEffect(() => {
    checkPermission()
  }, [checkPermission])

  const handleRequestPermission = () => {
    request(permissions[step].permission)
      .then(checkPermission)
      .then(() => setStep(step + 1))
  }

  if (permissions[step]) {
    if (!permissionCheckResult) {
      return <Text>Checking location permission...</Text>
    }

    if (permissionCheckResult !== 'granted') {
      return (
        <>
          <Text h1>{permissions[step].title}</Text>
          <Button
            title="Grant Permission Now"
            onPress={handleRequestPermission}
          ></Button>
        </>
      )
    }
  }
  return <>{children}</>
}
