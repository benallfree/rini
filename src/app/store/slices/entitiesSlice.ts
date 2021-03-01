import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { forEach, reduce } from '@s-libs/micro-dash'
import { PointInTime } from './sessionSlice'

export interface Entity extends PointInTime {}

interface EntitiesById {
  [_: string]: Entity
}
interface EntitiesState {
  nearby: EntitiesById
}

// Define the initial state using that type
const initialState: EntitiesState = { nearby: {} }

export interface PositionsByEntityId {
  [_: string]: PointInTime
}

export const entitiesSlice = createSlice({
  name: 'location',
  initialState,
  reducers: {
    dropOldEntities: (state) => {
      const expiry = +new Date() - 1000
      const nearby = reduce(
        state.nearby,
        (c, e, k) => {
          if (e.time < expiry) return c
          c[k] = e
          return c
        },
        {} as EntitiesById
      )

      state.nearby = nearby
    },
    nearbyEntitiesChanged: (state, action: PayloadAction<PositionsByEntityId>) => {
      const updatedEntities = action.payload
      const nearby = { ...state.nearby }

      forEach(updatedEntities, (incomingEntity, id) => {
        const oldEntity = nearby[id]
        if (!oldEntity) {
          nearby[id] = incomingEntity
        } else {
          if (incomingEntity.time > oldEntity.time) {
            nearby[id] = incomingEntity
          }
        }
      })
      state.nearby = nearby
    },
  },
})

// Action creators are generated for eache case reducer function
export const { nearbyEntitiesChanged, dropOldEntities } = entitiesSlice.actions

export default entitiesSlice.reducer
