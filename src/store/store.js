import { configureStore } from '@reduxjs/toolkit'
import stockReducer from './stockSlice'
import apiReducer from './apiSlice'

export const store = configureStore({
  reducer: {
    stock: stockReducer,
    api: apiReducer,
  },
})
