import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { mockOrderBook } from '../services/mockData'

function OrderBook() {
  const { currentSymbol } = useSelector((state) => state.stock)
  const [orderBook, setOrderBook] = useState(null)

  useEffect(() => {
    if (!currentSymbol) return

    // Load mock order book data
    // In a real app, this would fetch from an API with real-time updates
    const data = mockOrderBook()
    setOrderBook(data)

    // Simulate updates every 5 seconds
    const interval = setInterval(() => {
      setOrderBook(mockOrderBook())
    }, 5000)

    return () => clearInterval(interval)
  }, [currentSymbol])

  if (!orderBook) return null

  const totalBidQty = orderBook.bids.reduce((sum, bid) => sum + bid.quantity, 0)
  const totalAskQty = orderBook.asks.reduce((sum, ask) => sum + ask.quantity, 0)

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Order Book</h2>
        <span className="text-xs px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded">
          Simulated Data
        </span>
      </div>

      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        Market depth showing top 5 bid/ask levels
      </p>

      <div className="grid grid-cols-2 gap-4">
        {/* Bids */}
        <div>
          <h3 className="text-sm font-semibold text-success mb-2">Bids (Buy)</h3>
          <div className="space-y-1">
            {orderBook.bids.map((bid, index) => (
              <OrderRow
                key={index}
                price={bid.price}
                quantity={bid.quantity}
                orders={bid.orders}
                total={totalBidQty}
                type="bid"
              />
            ))}
          </div>
          <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
            Total: {totalBidQty.toLocaleString()}
          </div>
        </div>

        {/* Asks */}
        <div>
          <h3 className="text-sm font-semibold text-danger mb-2">Asks (Sell)</h3>
          <div className="space-y-1">
            {orderBook.asks.map((ask, index) => (
              <OrderRow
                key={index}
                price={ask.price}
                quantity={ask.quantity}
                orders={ask.orders}
                total={totalAskQty}
                type="ask"
              />
            ))}
          </div>
          <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
            Total: {totalAskQty.toLocaleString()}
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Spread:</span>
          <span className="font-semibold">
            ₹{(orderBook.asks[0].price - orderBook.bids[0].price).toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  )
}

function OrderRow({ price, quantity, orders, total, type }) {
  const percentage = (quantity / total) * 100

  return (
    <div className="relative">
      {/* Background bar */}
      <div
        className={`absolute inset-0 ${
          type === 'bid'
            ? 'bg-success/10 dark:bg-success/20'
            : 'bg-danger/10 dark:bg-danger/20'
        } rounded`}
        style={{ width: `${percentage}%` }}
      ></div>

      {/* Content */}
      <div className="relative flex justify-between items-center px-2 py-1 text-xs">
        <span className={`font-semibold ${type === 'bid' ? 'text-success' : 'text-danger'}`}>
          ₹{price.toFixed(2)}
        </span>
        <div className="flex gap-2">
          <span className="text-gray-700 dark:text-gray-300">{quantity}</span>
          <span className="text-gray-500 dark:text-gray-500">({orders})</span>
        </div>
      </div>
    </div>
  )
}

export default OrderBook
