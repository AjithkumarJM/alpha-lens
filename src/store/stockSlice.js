import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  currentSymbol: null,
  quote: null,
  historicalData: null,
  fundamentals: null,
  indicators: null,
  earnings: null,
  orderBook: null,
  loading: false,
  error: null,
}

const stockSlice = createSlice({
  name: 'stock',
  initialState,
  reducers: {
    setSymbol: (state, action) => {
      state.currentSymbol = action.payload
      state.error = null
    },
    setQuote: (state, action) => {
      state.quote = action.payload
    },
    setHistoricalData: (state, action) => {
      state.historicalData = action.payload
    },
    setFundamentals: (state, action) => {
      state.fundamentals = action.payload
    },
    setIndicators: (state, action) => {
      state.indicators = action.payload
    },
    setEarnings: (state, action) => {
      state.earnings = action.payload
    },
    setOrderBook: (state, action) => {
      state.orderBook = action.payload
    },
    setLoading: (state, action) => {
      state.loading = action.payload
    },
    setError: (state, action) => {
      state.error = action.payload
    },
    clearData: (state) => {
      state.quote = null
      state.historicalData = null
      state.fundamentals = null
      state.indicators = null
      state.earnings = null
      state.orderBook = null
      state.error = null
    },
  },
})

export const {
  setSymbol,
  setQuote,
  setHistoricalData,
  setFundamentals,
  setIndicators,
  setEarnings,
  setOrderBook,
  setLoading,
  setError,
  clearData,
} = stockSlice.actions

export default stockSlice.reducer
