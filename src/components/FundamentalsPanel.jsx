import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setFundamentals } from '../store/stockSlice'
import { fetchFundamentals } from '../services/api'

function FundamentalsPanel() {
  const dispatch = useDispatch()
  const { currentSymbol, fundamentals } = useSelector((state) => state.stock)
  const { useMockData } = useSelector((state) => state.api)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!currentSymbol) return

    const loadFundamentals = async () => {
      setLoading(true)
      try {
        const data = await fetchFundamentals(currentSymbol, dispatch, useMockData)
        dispatch(setFundamentals(data))
      } catch (error) {
        console.error('Failed to load fundamentals:', error)
      } finally {
        setLoading(false)
      }
    }

    loadFundamentals()
  }, [currentSymbol, dispatch, useMockData])

  if (loading) {
    return (
      <div className="card p-6">
        <h2 className="text-xl font-bold mb-4">Fundamentals</h2>
        <div className="animate-pulse space-y-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  if (!fundamentals) return null

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Fundamentals</h2>
        {fundamentals.source && (
          <span className="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">
            {fundamentals.source}
          </span>
        )}
      </div>

      <div className="space-y-3">
        <FundamentalRow
          label="Market Cap"
          value={formatMarketCap(fundamentals.marketCap)}
        />
        <FundamentalRow
          label="P/E Ratio"
          value={fundamentals.pe > 0 ? fundamentals.pe.toFixed(2) : 'N/A'}
        />
        <FundamentalRow
          label="P/B Ratio"
          value={fundamentals.pb > 0 ? fundamentals.pb.toFixed(2) : 'N/A'}
        />
        <FundamentalRow
          label="EPS"
          value={fundamentals.eps > 0 ? `₹${fundamentals.eps.toFixed(2)}` : 'N/A'}
        />
        <FundamentalRow
          label="Dividend Yield"
          value={fundamentals.dividendYield > 0 ? `${fundamentals.dividendYield.toFixed(2)}%` : 'N/A'}
        />
        <FundamentalRow
          label="ROE"
          value={fundamentals.roe > 0 ? `${fundamentals.roe.toFixed(2)}%` : 'N/A'}
        />
        <FundamentalRow
          label="Profit Margin"
          value={fundamentals.profitMargin > 0 ? `${fundamentals.profitMargin.toFixed(2)}%` : 'N/A'}
        />
        <FundamentalRow
          label="Beta"
          value={fundamentals.beta > 0 ? fundamentals.beta.toFixed(2) : 'N/A'}
        />
        <FundamentalRow
          label="52W High"
          value={fundamentals.week52High > 0 ? `₹${fundamentals.week52High.toFixed(2)}` : 'N/A'}
        />
        <FundamentalRow
          label="52W Low"
          value={fundamentals.week52Low > 0 ? `₹${fundamentals.week52Low.toFixed(2)}` : 'N/A'}
        />
      </div>

      {/* Sector & Industry */}
      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="flex flex-wrap gap-2">
          <span className="px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full text-sm font-medium">
            {fundamentals.sector}
          </span>
          <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm">
            {fundamentals.industry}
          </span>
        </div>
      </div>

      {/* Description */}
      {fundamentals.description && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
            {fundamentals.description}
          </p>
        </div>
      )}
    </div>
  )
}

function FundamentalRow({ label, value }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
      <span className="text-sm text-gray-600 dark:text-gray-400">{label}</span>
      <span className="font-semibold text-gray-900 dark:text-gray-100">{value}</span>
    </div>
  )
}

function formatMarketCap(value) {
  if (value >= 1e12) {
    return `₹${(value / 1e12).toFixed(2)}T`
  } else if (value >= 1e9) {
    return `₹${(value / 1e9).toFixed(2)}B`
  } else if (value >= 1e6) {
    return `₹${(value / 1e6).toFixed(2)}M`
  }
  return 'N/A'
}

export default FundamentalsPanel
