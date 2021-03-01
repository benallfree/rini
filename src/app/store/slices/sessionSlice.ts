import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface SessionTokens {
  idToken: string
  uid: string
}
interface SessionState {
  tokens: Partial<SessionTokens>
}

// Define the initial state using that type
const initialState: SessionState = {
  tokens: {},
}

export const sesionSlice = createSlice({
  name: 'session',
  initialState,
  reducers: {
    login: (state, action: PayloadAction<SessionTokens>) => {
      console.log('updating session tokens', { action })
      state.tokens = action.payload
    },
    logout: (state) => {
      console.log('logging out')
      state.tokens = {}
    },
  },
})

// Action creators are generated for eache case reducer function
export const { login, logout } = sesionSlice.actions

export default sesionSlice.reducer
