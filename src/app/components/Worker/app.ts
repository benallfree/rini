import { createClientNetcode } from '../../../client'

const client = createClientNetcode()
const { onConnect } = client

onConnect(() => {
  console.log('connected')
})
