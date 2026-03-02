import { useDispatch } from 'react-redux'
import { setSymbol } from '../store/stockSlice'

const popularStocks = [
  { symbol: 'RELIANCE.NS', name: 'Reliance Industries', sector: 'Energy' },
  { symbol: 'TCS.NS', name: 'Tata Consultancy Services', sector: 'Technology' },
  { symbol: 'INFY.NS', name: 'Infosys', sector: 'Technology' },
  { symbol: 'HDFCBANK.NS', name: 'HDFC Bank', sector: 'Financial Services' },
  { symbol: 'ICICIBANK.NS', name: 'ICICI Bank', sector: 'Financial Services' },
  { symbol: 'HINDUNILVR.NS', name: 'Hindustan Unilever', sector: 'Consumer Goods' },
  { symbol: 'BHARTIARTL.NS', name: 'Bharti Airtel', sector: 'Telecommunications' },
  { symbol: 'ITC.NS', name: 'ITC Ltd', sector: 'Consumer Goods' },
  { symbol: 'SBIN.NS', name: 'State Bank of India', sector: 'Financial Services' },
  { symbol: 'WIPRO.NS', name: 'Wipro', sector: 'Technology' },
]

function DemoDataPanel() {
  const dispatch = useDispatch()

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="card p-8 text-center">
        <h2 className="text-3xl font-bold mb-4">Welcome to Indian Stock Market</h2>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Search for any NSE/BSE listed stock using the search bar above, or click on one of the
          popular stocks below to get started.
        </p>
      </div>

      {/* Popular Stocks Grid */}
      <div>
        <h3 className="text-xl font-bold mb-4">Popular Stocks</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {popularStocks.map((stock) => (
            <button
              key={stock.symbol}
              onClick={() => dispatch(setSymbol(stock.symbol))}
              className="card p-4 text-left hover:shadow-lg transition-shadow group"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-bold text-lg text-gray-900 dark:text-gray-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                    {stock.symbol.replace('.NS', '')}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{stock.name}</p>
                </div>
                <span className="text-xs px-2 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded">
                  {stock.sector}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Features Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <FeatureCard
          icon="📊"
          title="Real-time Quotes"
          description="Live stock prices with daily high, low, volume, and more"
        />
        <FeatureCard
          icon="📈"
          title="Interactive Charts"
          description="OHLC charts with SMA overlays and multiple timeframes"
        />
        <FeatureCard
          icon="🔍"
          title="Technical Analysis"
          description="Client-side calculated RSI, MACD, and moving averages"
        />
        <FeatureCard
          icon="💼"
          title="Fundamentals"
          description="Key financial ratios including P/E, P/B, ROE, and more"
        />
        <FeatureCard
          icon="💰"
          title="Earnings Data"
          description="Quarterly and annual earnings with EPS surprise tracking"
        />
        <FeatureCard
          icon="📖"
          title="Order Book"
          description="Market depth visualization (simulated demo data)"
        />
      </div>

      {/* API Info */}
      <div className="card p-6 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
        <h3 className="font-bold text-blue-900 dark:text-blue-300 mb-2">About This App</h3>
        <div className="text-sm text-blue-800 dark:text-blue-400 space-y-2">
          <p>
            This is a frontend-only stock market app using free public APIs (IndianAPI.in and Alpha Vantage).
            All technical indicators are calculated client-side.
          </p>
          <p>
            <strong>Note:</strong> Due to API rate limits and CORS restrictions, some features may use fallback
            mock data. For production use, consider adding a backend proxy.
          </p>
        </div>
      </div>
    </div>
  )
}

function FeatureCard({ icon, title, description }) {
  return (
    <div className="card p-6 text-center">
      <div className="text-4xl mb-3">{icon}</div>
      <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-2">{title}</h4>
      <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
    </div>
  )
}

export default DemoDataPanel
