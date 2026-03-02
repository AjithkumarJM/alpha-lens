import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import SearchBar from '../components/SearchBar'
import stockReducer from '../store/stockSlice'
import apiReducer from '../store/apiSlice'

describe('SearchBar', () => {
  let store

  beforeEach(() => {
    store = configureStore({
      reducer: {
        stock: stockReducer,
        api: apiReducer,
      },
    })
  })

  it('renders search input', () => {
    render(
      <Provider store={store}>
        <SearchBar />
      </Provider>
    )

    const input = screen.getByPlaceholderText(/search stocks/i)
    expect(input).toBeInTheDocument()
  })

  it('shows search results after typing', async () => {
    render(
      <Provider store={store}>
        <SearchBar />
      </Provider>
    )

    const input = screen.getByPlaceholderText(/search stocks/i)
    fireEvent.change(input, { target: { value: 'RELIANCE' } })

    await waitFor(() => {
      expect(screen.getByText(/searching/i)).toBeInTheDocument()
    }, { timeout: 500 })
  })

  it('clears input when clear button is clicked', () => {
    render(
      <Provider store={store}>
        <SearchBar />
      </Provider>
    )

    const input = screen.getByPlaceholderText(/search stocks/i)
    fireEvent.change(input, { target: { value: 'TCS' } })

    expect(input.value).toBe('TCS')

    const clearButton = screen.getByLabelText(/clear search/i)
    fireEvent.click(clearButton)

    expect(input.value).toBe('')
  })
})
