import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { forEach, reduce } from '@s-libs/micro-dash'
import { getDistance } from 'geolib'
import { Draft } from 'immer'
import { Point, PointInTime } from './profileSlice'
export interface Entity extends PointInTime {
  id: string
}

export interface NearbyEntity extends Entity {
  distance: number
}

interface NearbyEntitiesById {
  [_: string]: NearbyEntity
}

interface EntitiesState {
  nearby: NearbyEntitiesById
}

// Define the initial state using that type
const initialState: EntitiesState = { nearby: {} }

export interface PointsByEntityId {
  [_: string]: PointInTime
}

const nearbyEntityChangedReducer = (
  state: Draft<EntitiesState>,
  action: PayloadAction<{ currentLocation: Point; entity: Entity }>
) => {
  console.log('nearbyEntityChangedReducer', action)
  const { currentLocation, entity } = action.payload
  const oldEntity = state.nearby[entity.id]
  if (!oldEntity || entity.time > oldEntity.time) {
    const distance = getDistance(currentLocation, entity)
    console.log('Recalculating distance from current', currentLocation, entity, distance)
    state.nearby[entity.id] = {
      ...entity,
      distance,
    }
  }
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
        {} as NearbyEntitiesById
      )

      state.nearby = nearby
    },
    nearbyEntitiesChanged: (
      state,
      action: PayloadAction<{ currentLocation: Point; nearby: PointsByEntityId }>
    ) => {
      const updatedEntities = action.payload.nearby
      const { currentLocation } = action.payload

      forEach(updatedEntities, (entity, id) => {
        nearbyEntityChangedReducer(
          state,
          nearbyEntityChanged({ currentLocation, entity: { ...entity, id } })
        )
      })
    },
    nearbyEntityChanged: nearbyEntityChangedReducer,
  },
})

// Action creators are generated for eache case reducer function
export const { nearbyEntitiesChanged, dropOldEntities, nearbyEntityChanged } = entitiesSlice.actions

export default entitiesSlice.reducer
