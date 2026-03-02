import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  apiStatus: {
    indianapi: 'unknown',
    alphavantage: 'unknown',
    yahoo: 'unknown',
    nse: 'unknown',
  },
  rateLimitInfo: {
    alphavantage: {
      remaining: 5,
      resetTime: null,
    },
  },
  useMockData: import.meta.env.VITE_API_MODE === 'mock',
}

const apiSlice = createSlice({
  name: 'api',
  initialState,
  reducers: {
    setApiStatus: (state, action) => {
      const { api, status } = action.payload
      state.apiStatus[api] = status
    },
    updateRateLimit: (state, action) => {
      const { api, remaining, resetTime } = action.payload
      state.rateLimitInfo[api] = { remaining, resetTime }
    },
    toggleMockData: (state) => {
      state.useMockData = !state.useMockData
    },
    setMockData: (state, action) => {
      state.useMockData = action.payload
    },
  },
})

export const { setApiStatus, updateRateLimit, toggleMockData, setMockData } = apiSlice.actions

export default apiSlice.reducer
