import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { FiTrendingUp, FiTrendingDown } from 'react-icons/fi'
import { setQuote, setLoading, setError } from '../store/stockSlice'
import { fetchQuote } from '../services/api'

function QuoteCard() {
  const dispatch = useDispatch()
  const { currentSymbol, quote, loading, error } = useSelector((state) => state.stock)
  const { useMockData } = useSelector((state) => state.api)

  useEffect(() => {
    if (!currentSymbol) return

    const loadQuote = async () => {
      dispatch(setLoading(true))
      try {
        const data = await fetchQuote(currentSymbol, dispatch, useMockData)
        dispatch(setQuote(data))
      } catch (err) {
        dispatch(setError(err.message))
      } finally {
        dispatch(setLoading(false))
      }
    }

    loadQuote()
    // Refresh every 30 seconds
    const interval = setInterval(loadQuote, 30000)
    return () => clearInterval(interval)
  }, [currentSymbol, dispatch, useMockData])

  if (loading && !quote) {
    return (
      <div className="card p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="card p-6 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
        <p className="text-red-600 dark:text-red-400">Error: {error}</p>
      </div>
    )
  }

  if (!quote) return null

  const isPositive = quote.change >= 0
  const priceColor = isPositive ? 'price-up' : 'price-down'

  return (
    <div className="card p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            {quote.symbol}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">{quote.name}</p>
        </div>
        {quote.source && (
          <span className="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">
            {quote.source}
          </span>
        )}
      </div>

      {/* Price */}
      <div className="mb-6">
        <div className="flex items-baseline gap-4">
          <span className="text-5xl font-bold text-gray-900 dark:text-gray-100">
            ₹{quote.price.toFixed(2)}
          </span>
          <div className={`flex items-center gap-2 text-xl font-semibold ${priceColor}`}>
            {isPositive ? <FiTrendingUp /> : <FiTrendingDown />}
            <span>
              {isPositive ? '+' : ''}
              {quote.change.toFixed(2)} ({isPositive ? '+' : ''}
              {quote.changePercent.toFixed(2)}%)
            </span>
          </div>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
          As of {new Date(quote.timestamp).toLocaleString()}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatItem label="Open" value={`₹${quote.open.toFixed(2)}`} />
        <StatItem label="High" value={`₹${quote.high.toFixed(2)}`} />
        <StatItem label="Low" value={`₹${quote.low.toFixed(2)}`} />
        <StatItem label="Prev Close" value={`₹${quote.previousClose.toFixed(2)}`} />
        <StatItem label="Volume" value={formatVolume(quote.volume)} />
        <StatItem label="Avg Volume" value={formatVolume(quote.avgVolume)} />
      </div>
    </div>
  )
}

function StatItem({ label, value }) {
  return (
    <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">{label}</p>
      <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{value}</p>
    </div>
  )
}

function formatVolume(volume) {
  if (volume >= 10000000) {
    return `${(volume / 10000000).toFixed(2)}Cr`
  } else if (volume >= 100000) {
    return `${(volume / 100000).toFixed(2)}L`
  } else if (volume >= 1000) {
    return `${(volume / 1000).toFixed(2)}K`
  }
  return volume.toString()
}

export default QuoteCard
