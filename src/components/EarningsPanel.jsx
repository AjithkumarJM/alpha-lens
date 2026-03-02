import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setEarnings } from '../store/stockSlice'
import { fetchEarnings } from '../services/api'

function EarningsPanel() {
  const dispatch = useDispatch()
  const { currentSymbol, earnings } = useSelector((state) => state.stock)
  const { useMockData } = useSelector((state) => state.api)
  const [loading, setLoading] = useState(false)
  const [view, setView] = useState('quarterly') // 'quarterly' or 'annual'

  useEffect(() => {
    if (!currentSymbol) return

    const loadEarnings = async () => {
      setLoading(true)
      try {
        const data = await fetchEarnings(currentSymbol, dispatch, useMockData)
        dispatch(setEarnings(data))
      } catch (error) {
        console.error('Failed to load earnings:', error)
      } finally {
        setLoading(false)
      }
    }

    loadEarnings()
  }, [currentSymbol, dispatch, useMockData])

  if (loading) {
    return (
      <div className="card p-6">
        <h2 className="text-xl font-bold mb-4">Earnings</h2>
        <div className="animate-pulse space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  if (!earnings) return null

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Earnings</h2>
        {earnings.source && (
          <span className="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">
            {earnings.source}
          </span>
        )}
      </div>

      {/* View Toggle */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setView('quarterly')}
          className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
            view === 'quarterly'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          Quarterly
        </button>
        <button
          onClick={() => setView('annual')}
          className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
            view === 'annual'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          Annual
        </button>
      </div>

      {/* Quarterly View */}
      {view === 'quarterly' && (
        <div className="space-y-3">
          {earnings.quarterly.length > 0 ? (
            earnings.quarterly.map((quarter, index) => (
              <div
                key={index}
                className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {new Date(quarter.date).toLocaleDateString('en-US', {
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                  {quarter.surprise !== 0 && (
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        quarter.surprise > 0
                          ? 'bg-success/20 text-success'
                          : 'bg-danger/20 text-danger'
                      }`}
                    >
                      {quarter.surprise > 0 ? '+' : ''}
                      {quarter.surprisePercent.toFixed(1)}%
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Reported:</span>
                    <span className="ml-2 font-semibold">
                      ₹{quarter.reportedEPS.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Estimated:</span>
                    <span className="ml-2 font-semibold">
                      ₹{quarter.estimatedEPS.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center py-4">No quarterly data available</p>
          )}
        </div>
      )}

      {/* Annual View */}
      {view === 'annual' && (
        <div className="space-y-3">
          {earnings.annual.length > 0 ? (
            earnings.annual.map((year, index) => (
              <div
                key={index}
                className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
              >
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    FY {year.fiscalYear}
                  </span>
                  <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
                    ₹{year.reportedEPS.toFixed(2)}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center py-4">No annual data available</p>
          )}
        </div>
      )}
    </div>
  )
}

export default EarningsPanel
