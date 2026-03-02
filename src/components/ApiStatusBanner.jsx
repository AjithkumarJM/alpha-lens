import { useSelector, useDispatch } from 'react-redux'
import { FiAlertCircle, FiCheckCircle, FiXCircle } from 'react-icons/fi'
import { toggleMockData } from '../store/apiSlice'

function ApiStatusBanner() {
  const { apiStatus, useMockData } = useSelector((state) => state.api)
  const dispatch = useDispatch()

  const hasErrors = Object.values(apiStatus).some(status => 
    status === 'error' || status === 'rate-limited'
  )

  if (!hasErrors && !useMockData) return null

  return (
    <div className="bg-yellow-50 dark:bg-yellow-900/20 border-b border-yellow-200 dark:border-yellow-800">
      <div className="container mx-auto px-4 py-3 max-w-7xl">
        <div className="flex items-start gap-3">
          <FiAlertCircle className="text-yellow-600 dark:text-yellow-400 text-xl flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-yellow-800 dark:text-yellow-300 mb-1">
              {useMockData ? 'Mock Data Mode' : 'API Status'}
            </h3>
            <div className="text-sm text-yellow-700 dark:text-yellow-400 space-y-1">
              {useMockData ? (
                <p>
                  Using simulated data. Toggle to try live APIs.{' '}
                  <button
                    onClick={() => dispatch(toggleMockData())}
                    className="underline font-medium hover:text-yellow-900 dark:hover:text-yellow-200"
                  >
                    Switch to Live
                  </button>
                </p>
              ) : (
                <>
                  <p>Some APIs are experiencing issues:</p>
                  <ul className="list-disc list-inside ml-2 space-y-1">
                    {apiStatus.indianapi === 'error' && (
                      <li>IndianAPI.in: Connection failed (using fallback)</li>
                    )}
                    {apiStatus.alphavantage === 'rate-limited' && (
                      <li>Alpha Vantage: Rate limit reached (5 calls/min)</li>
                    )}
                    {apiStatus.alphavantage === 'error' && (
                      <li>Alpha Vantage: Connection failed (using fallback)</li>
                    )}
                  </ul>
                  <p className="mt-2">
                    <button
                      onClick={() => dispatch(toggleMockData())}
                      className="underline font-medium hover:text-yellow-900 dark:hover:text-yellow-200"
                    >
                      Switch to Mock Data
                    </button>
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ApiStatusBanner
