import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import SearchBar from './components/SearchBar'
import QuoteCard from './components/QuoteCard'
import OHLCChart from './components/OHLCChart'
import FundamentalsPanel from './components/FundamentalsPanel'
import IndicatorsPanel from './components/IndicatorsPanel'
import OrderBook from './components/OrderBook'
import EarningsPanel from './components/EarningsPanel'
import Header from './components/Header'
import ErrorBoundary from './components/ErrorBoundary'
import ApiStatusBanner from './components/ApiStatusBanner'
import DemoDataPanel from './components/DemoDataPanel'
import { setSymbol } from './store/stockSlice'

function App() {
  const dispatch = useDispatch()
  const { currentSymbol } = useSelector((state) => state.stock)
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode')
    return saved ? JSON.parse(saved) : false
  })

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    localStorage.setItem('darkMode', JSON.stringify(darkMode))
  }, [darkMode])

  // Handle URL-based symbol loading
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const symbol = params.get('symbol')
    if (symbol) {
      dispatch(setSymbol(symbol))
    }
  }, [dispatch])

  // Update URL when symbol changes
  useEffect(() => {
    if (currentSymbol) {
      const url = new URL(window.location)
      url.searchParams.set('symbol', currentSymbol)
      window.history.pushState({}, '', url)
    }
  }, [currentSymbol])

  return (
    <ErrorBoundary>
      <div className="min-h-screen">
        <Header darkMode={darkMode} setDarkMode={setDarkMode} />
        <ApiStatusBanner />
        
        <main className="container mx-auto px-4 py-6 max-w-7xl">
          <div className="mb-6">
            <SearchBar />
          </div>

          {!currentSymbol ? (
            <DemoDataPanel />
          ) : (
            <div className="space-y-6">
              {/* Quote Section */}
              <QuoteCard />

              {/* Chart Section */}
              <div className="card p-6">
                <OHLCChart />
              </div>

              {/* Two Column Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-6">
                  <FundamentalsPanel />
                  <EarningsPanel />
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  <IndicatorsPanel />
                  <OrderBook />
                </div>
              </div>
            </div>
          )}
        </main>

        <footer className="mt-12 py-6 border-t border-gray-200 dark:border-gray-700">
          <div className="container mx-auto px-4 text-center text-sm text-gray-600 dark:text-gray-400">
            <p>
              ⚠️ <strong>Security Notice:</strong> API keys are exposed in frontend code. 
              For production, use a serverless backend proxy. <a href="#" className="text-primary-600 hover:underline">Learn more</a>
            </p>
            <p className="mt-2">
              Data provided by free public APIs. Not financial advice. Use at your own risk.
            </p>
          </div>
        </footer>
      </div>
    </ErrorBoundary>
  )
}

export default App
