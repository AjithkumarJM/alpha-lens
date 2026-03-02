import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { calculateRSI, calculateMACD } from '../utils/indicators'

function IndicatorsPanel() {
  const { historicalData, indicators } = useSelector((state) => state.stock)
  const [rsi, setRsi] = useState(null)
  const [macd, setMacd] = useState(null)

  useEffect(() => {
    if (!historicalData || historicalData.length === 0) return

    // Calculate RSI
    const rsiData = calculateRSI(historicalData, 14)
    if (rsiData.length > 0) {
      setRsi(rsiData[rsiData.length - 1].value)
    }

    // Calculate MACD
    const macdData = calculateMACD(historicalData)
    if (macdData.histogram.length > 0) {
      const latest = macdData.histogram[macdData.histogram.length - 1]
      setMacd({
        value: latest.value,
        signal: macdData.signal[macdData.signal.length - 1].value,
        macdLine: macdData.macd[macdData.macd.length - 1].value,
      })
    }
  }, [historicalData])

  const sma50 = indicators?.sma50?.[indicators.sma50.length - 1]?.value
  const sma200 = indicators?.sma200?.[indicators.sma200.length - 1]?.value

  const getRSIStatus = (value) => {
    if (value >= 70) return { label: 'Overbought', color: 'text-danger' }
    if (value <= 30) return { label: 'Oversold', color: 'text-success' }
    return { label: 'Neutral', color: 'text-gray-600 dark:text-gray-400' }
  }

  const getMACDStatus = (value) => {
    if (value > 0) return { label: 'Bullish', color: 'text-success' }
    if (value < 0) return { label: 'Bearish', color: 'text-danger' }
    return { label: 'Neutral', color: 'text-gray-600 dark:text-gray-400' }
  }

  return (
    <div className="card p-6">
      <h2 className="text-xl font-bold mb-4">Technical Indicators</h2>

      <div className="space-y-4">
        {/* SMA 50 */}
        <IndicatorCard
          title="SMA 50"
          value={sma50 ? `₹${sma50.toFixed(2)}` : 'Calculating...'}
          description="50-day Simple Moving Average"
        />

        {/* SMA 200 */}
        <IndicatorCard
          title="SMA 200"
          value={sma200 ? `₹${sma200.toFixed(2)}` : 'Calculating...'}
          description="200-day Simple Moving Average"
        />

        {/* RSI */}
        {rsi !== null && (
          <IndicatorCard
            title="RSI (14)"
            value={rsi.toFixed(2)}
            description="Relative Strength Index"
            badge={getRSIStatus(rsi)}
          >
            <div className="mt-2">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${
                    rsi >= 70
                      ? 'bg-danger'
                      : rsi <= 30
                      ? 'bg-success'
                      : 'bg-primary-600'
                  }`}
                  style={{ width: `${rsi}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0</span>
                <span>30</span>
                <span>70</span>
                <span>100</span>
              </div>
            </div>
          </IndicatorCard>
        )}

        {/* MACD */}
        {macd !== null && (
          <IndicatorCard
            title="MACD"
            value={macd.value.toFixed(2)}
            description="Moving Average Convergence Divergence"
            badge={getMACDStatus(macd.value)}
          >
            <div className="mt-2 space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">MACD Line:</span>
                <span className="font-medium">{macd.macdLine.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Signal Line:</span>
                <span className="font-medium">{macd.signal.toFixed(2)}</span>
              </div>
            </div>
          </IndicatorCard>
        )}

        {/* Golden Cross / Death Cross */}
        {sma50 && sma200 && (
          <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div className="flex items-center gap-2">
              {sma50 > sma200 ? (
                <>
                  <span className="text-2xl">📈</span>
                  <div>
                    <p className="font-semibold text-success">Golden Cross</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      SMA 50 above SMA 200 (Bullish)
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <span className="text-2xl">📉</span>
                  <div>
                    <p className="font-semibold text-danger">Death Cross</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      SMA 50 below SMA 200 (Bearish)
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          * Indicators calculated client-side from historical data
        </p>
      </div>
    </div>
  )
}

function IndicatorCard({ title, value, description, badge, children }) {
  return (
    <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
      <div className="flex items-start justify-between mb-2">
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
          <p className="text-xs text-gray-600 dark:text-gray-400">{description}</p>
        </div>
        {badge && (
          <span className={`text-sm font-medium ${badge.color}`}>{badge.label}</span>
        )}
      </div>
      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-2">{value}</p>
      {children}
    </div>
  )
}

export default IndicatorsPanel
