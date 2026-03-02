/**
 * Mock data for testing and fallback when APIs are unavailable
 */

export function mockQuoteData(symbol) {
  const basePrice = 1500 + Math.random() * 500
  const change = (Math.random() - 0.5) * 50
  
  return {
    symbol,
    name: getStockName(symbol),
    price: basePrice,
    change,
    changePercent: (change / basePrice) * 100,
    open: basePrice - Math.random() * 20,
    high: basePrice + Math.random() * 30,
    low: basePrice - Math.random() * 30,
    previousClose: basePrice - change,
    volume: Math.floor(1000000 + Math.random() * 5000000),
    avgVolume: Math.floor(1200000 + Math.random() * 3000000),
    timestamp: new Date().toISOString(),
    source: 'mock',
  }
}

export function mockHistoricalData(symbol, range = '1M') {
  const points = getRangePoints(range)
  const data = []
  const now = new Date()
  let basePrice = 1500 + Math.random() * 500
  
  for (let i = points; i >= 0; i--) {
    const date = new Date(now)
    
    if (range === '1D') {
      date.setHours(date.getHours() - i)
    } else {
      date.setDate(date.getDate() - i)
    }
    
    // Random walk with trend
    const change = (Math.random() - 0.48) * 10 // Slight upward bias
    basePrice += change
    
    const open = basePrice + (Math.random() - 0.5) * 5
    const close = basePrice + (Math.random() - 0.5) * 5
    const high = Math.max(open, close) + Math.random() * 10
    const low = Math.min(open, close) - Math.random() * 10
    
    data.push({
      date: date.toISOString().split('T')[0],
      open: Math.max(0, open),
      high: Math.max(0, high),
      low: Math.max(0, low),
      close: Math.max(0, close),
      volume: Math.floor(500000 + Math.random() * 2000000),
    })
  }
  
  return data
}

export function mockFundamentals(symbol) {
  return {
    marketCap: 500000000000 + Math.random() * 1000000000000,
    pe: 15 + Math.random() * 30,
    pb: 2 + Math.random() * 5,
    eps: 50 + Math.random() * 100,
    dividendYield: Math.random() * 3,
    roe: 10 + Math.random() * 20,
    revenue: 100000000000 + Math.random() * 500000000000,
    profitMargin: 5 + Math.random() * 20,
    beta: 0.8 + Math.random() * 0.8,
    week52High: 2000 + Math.random() * 500,
    week52Low: 1200 + Math.random() * 300,
    sharesOutstanding: 1000000000 + Math.random() * 5000000000,
    sector: getSector(symbol),
    industry: 'Technology',
    description: `${getStockName(symbol)} is a leading company in its sector...`,
    source: 'mock',
  }
}

export function mockEarnings(symbol) {
  const quarters = []
  const now = new Date()
  
  for (let i = 0; i < 8; i++) {
    const date = new Date(now)
    date.setMonth(date.getMonth() - (i * 3))
    
    const reportedEPS = 10 + Math.random() * 30
    const estimatedEPS = reportedEPS + (Math.random() - 0.5) * 5
    
    quarters.push({
      date: date.toISOString().split('T')[0],
      reportedEPS,
      estimatedEPS,
      surprise: reportedEPS - estimatedEPS,
      surprisePercent: ((reportedEPS - estimatedEPS) / estimatedEPS) * 100,
    })
  }
  
  const years = []
  for (let i = 0; i < 5; i++) {
    const year = now.getFullYear() - i
    years.push({
      fiscalYear: year.toString(),
      reportedEPS: 100 + Math.random() * 200,
    })
  }
  
  return {
    quarterly: quarters,
    annual: years,
    source: 'mock',
  }
}

export function mockOrderBook() {
  const bids = []
  const asks = []
  const basePrice = 1500 + Math.random() * 500
  
  for (let i = 0; i < 5; i++) {
    bids.push({
      price: basePrice - (i + 1) * 0.5,
      quantity: Math.floor(100 + Math.random() * 1000),
      orders: Math.floor(1 + Math.random() * 10),
    })
    
    asks.push({
      price: basePrice + (i + 1) * 0.5,
      quantity: Math.floor(100 + Math.random() * 1000),
      orders: Math.floor(1 + Math.random() * 10),
    })
  }
  
  return { bids, asks, source: 'mock' }
}

function getRangePoints(range) {
  const map = {
    '1D': 78, // 5-min intervals for 6.5 hours
    '5D': 5,
    '1M': 30,
    '3M': 90,
    '1Y': 365,
  }
  return map[range] || 30
}

function getStockName(symbol) {
  const names = {
    'RELIANCE.NS': 'Reliance Industries Ltd',
    'TCS.NS': 'Tata Consultancy Services Ltd',
    'INFY.NS': 'Infosys Ltd',
    'HDFCBANK.NS': 'HDFC Bank Ltd',
    'ICICIBANK.NS': 'ICICI Bank Ltd',
    'HINDUNILVR.NS': 'Hindustan Unilever Ltd',
    'BHARTIARTL.NS': 'Bharti Airtel Ltd',
    'ITC.NS': 'ITC Ltd',
    'SBIN.NS': 'State Bank of India',
    'WIPRO.NS': 'Wipro Ltd',
  }
  return names[symbol] || symbol.replace('.NS', '').replace('.BO', '') + ' Ltd'
}

function getSector(symbol) {
  const sectors = {
    'RELIANCE.NS': 'Energy',
    'TCS.NS': 'Technology',
    'INFY.NS': 'Technology',
    'HDFCBANK.NS': 'Financial Services',
    'ICICIBANK.NS': 'Financial Services',
    'HINDUNILVR.NS': 'Consumer Goods',
    'BHARTIARTL.NS': 'Telecommunications',
    'ITC.NS': 'Consumer Goods',
    'SBIN.NS': 'Financial Services',
    'WIPRO.NS': 'Technology',
  }
  return sectors[symbol] || 'Diversified'
}
