import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import App from '../App'
import stockReducer from '../store/stockSlice'
import apiReducer from '../store/apiSlice'

// Mock API calls
vi.mock('../services/api', () => ({
  searchSymbols: vi.fn(() => Promise.resolve([
    { symbol: 'RELIANCE.NS', name: 'Reliance Industries Ltd' },
  ])),
  fetchQuote: vi.fn(() => Promise.resolve({
    symbol: 'RELIANCE.NS',
    name: 'Reliance Industries Ltd',
    price: 2450.50,
    change: 25.30,
    changePercent: 1.04,
  })),
  fetchHistoricalData: vi.fn(() => Promise.resolve([])),
  fetchFundamentals: vi.fn(() => Promise.resolve({})),
  fetchEarnings: vi.fn(() => Promise.resolve({ quarterly: [], annual: [] })),
}))

describe('Integration: Search to Quote workflow', () => {
  let store

  beforeEach(() => {
    store = configureStore({
      reducer: {
        stock: stockReducer,
        api: apiReducer,
      },
    })
  })

  it('completes search to quote display workflow', async () => {
    const user = userEvent.setup()

    render(
      <Provider store={store}>
        <App />
      </Provider>
    )

    // Initially shows demo panel
    expect(screen.getByText(/welcome to indian stock market/i)).toBeInTheDocument()

    // Type in search
    const searchInput = screen.getByPlaceholderText(/search stocks/i)
    await user.type(searchInput, 'RELIANCE')

    // Wait for search results (debounced)
    await waitFor(() => {
      expect(screen.getByText(/reliance industries/i)).toBeInTheDocument()
    }, { timeout: 2000 })

    // Click on result
    const result = screen.getByText(/reliance industries/i)
    await user.click(result)

    // Quote should be displayed
    await waitFor(() => {
      expect(screen.getByText(/RELIANCE.NS/i)).toBeInTheDocument()
    }, { timeout: 2000 })
  })
})
