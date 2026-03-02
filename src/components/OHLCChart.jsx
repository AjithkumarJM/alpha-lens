import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { setHistoricalData, setIndicators } from '../store/stockSlice'
import { fetchHistoricalData } from '../services/api'
import { calculateSMA } from '../utils/indicators'

const timeRanges = ['1D', '5D', '1M', '3M', '1Y']

function OHLCChart() {
  const dispatch = useDispatch()
  const { currentSymbol, historicalData } = useSelector((state) => state.stock)
  const { useMockData } = useSelector((state) => state.api)
  const [selectedRange, setSelectedRange] = useState('1M')
  const [loading, setLoading] = useState(false)
  const [showVolume, setShowVolume] = useState(true)
  const [showSMA, setShowSMA] = useState(true)

  useEffect(() => {
    if (!currentSymbol) return

    const loadData = async () => {
      setLoading(true)
      try {
        const data = await fetchHistoricalData(currentSymbol, selectedRange, dispatch, useMockData)
        dispatch(setHistoricalData(data))
        
        // Calculate indicators
        const sma50 = calculateSMA(data, 50)
        const sma200 = calculateSMA(data, 200)
        dispatch(setIndicators({ sma50, sma200 }))
      } catch (error) {
        console.error('Failed to load historical data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [currentSymbol, selectedRange, dispatch, useMockData])

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin inline-block w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Loading chart...</p>
        </div>
      </div>
    )
  }

  if (!historicalData || historicalData.length === 0) {
    return (
      <div className="h-96 flex items-center justify-center text-gray-500">
        No chart data available
      </div>
    )
  }

  // Prepare data for chart
  const chartData = historicalData.map((item) => ({
    ...item,
    displayDate: formatDate(item.date, selectedRange),
  }))

  // Add SMA data
  const sma50Data = calculateSMA(historicalData, 50)
  const sma200Data = calculateSMA(historicalData, 200)

  // Merge SMA with chart data
  const mergedData = chartData.map((item) => {
    const sma50Point = sma50Data.find((s) => s.date === item.date)
    const sma200Point = sma200Data.find((s) => s.date === item.date)
    return {
      ...item,
      sma50: sma50Point?.value,
      sma200: sma200Point?.value,
    }
  })

  return (
    <div>
      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
        <div className="flex gap-2">
          {timeRanges.map((range) => (
            <button
              key={range}
              onClick={() => setSelectedRange(range)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedRange === range
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              {range}
            </button>
          ))}
        </div>

        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showSMA}
              onChange={(e) => setShowSMA(e.target.checked)}
              className="w-4 h-4"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Show SMA</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showVolume}
              onChange={(e) => setShowVolume(e.target.checked)}
              className="w-4 h-4"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Show Volume</span>
          </label>
        </div>
      </div>

      {/* Price Chart */}
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={mergedData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
          <XAxis
            dataKey="displayDate"
            stroke="#9CA3AF"
            tick={{ fill: '#9CA3AF' }}
            tickMargin={10}
          />
          <YAxis
            stroke="#9CA3AF"
            tick={{ fill: '#9CA3AF' }}
            tickMargin={10}
            domain={['dataMin - 10', 'dataMax + 10']}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1F2937',
              border: '1px solid #374151',
              borderRadius: '8px',
              color: '#F3F4F6',
            }}
            formatter={(value) => [`₹${value.toFixed(2)}`, '']}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="close"
            stroke="#0EA5E9"
            strokeWidth={2}
            dot={false}
            name="Close"
          />
          {showSMA && (
            <>
              <Line
                type="monotone"
                dataKey="sma50"
                stroke="#F59E0B"
                strokeWidth={1.5}
                dot={false}
                name="SMA 50"
                strokeDasharray="5 5"
              />
              <Line
                type="monotone"
                dataKey="sma200"
                stroke="#EF4444"
                strokeWidth={1.5}
                dot={false}
                name="SMA 200"
                strokeDasharray="5 5"
              />
            </>
          )}
        </LineChart>
      </ResponsiveContainer>

      {/* Volume Chart */}
      {showVolume && (
        <ResponsiveContainer width="100%" height={150} className="mt-4">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
            <XAxis
              dataKey="displayDate"
              stroke="#9CA3AF"
              tick={{ fill: '#9CA3AF' }}
              tickMargin={10}
            />
            <YAxis
              stroke="#9CA3AF"
              tick={{ fill: '#9CA3AF' }}
              tickMargin={10}
              tickFormatter={(value) => {
                if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`
                if (value >= 1000) return `${(value / 1000).toFixed(1)}K`
                return value
              }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1F2937',
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#F3F4F6',
              }}
              formatter={(value) => [value.toLocaleString(), 'Volume']}
            />
            <Bar dataKey="volume" fill="#0EA5E9" opacity={0.6} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}

function formatDate(dateString, range) {
  const date = new Date(dateString)
  
  if (range === '1D') {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  } else if (range === '5D' || range === '1M') {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  } else {
    return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
  }
}

export default OHLCChart
