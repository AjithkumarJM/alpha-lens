import { FiMoon, FiSun } from 'react-icons/fi'

function Header({ darkMode, setDarkMode }) {
  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="container mx-auto px-4 py-4 max-w-7xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-3xl">📈</div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Indian Stock Market
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Real-time NSE/BSE equity analysis
              </p>
            </div>
          </div>

          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-3 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            aria-label="Toggle dark mode"
          >
            {darkMode ? (
              <FiSun className="text-xl text-yellow-500" />
            ) : (
              <FiMoon className="text-xl text-gray-700" />
            )}
          </button>
        </div>
      </div>
    </header>
  )
}

export default Header
