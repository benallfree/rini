import { createEngine } from '../engine/createEngine'
import { nanoid } from '../nanoid/index.native'

export const engine = createEngine({ nanoid })
