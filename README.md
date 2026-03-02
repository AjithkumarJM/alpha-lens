# Indian Stock Market - Frontend-Only Web App

A modern, responsive stock market web application for Indian equities (NSE/BSE) built with React, Vite, and Tailwind CSS. Features real-time quotes, interactive charts, technical indicators, and fundamentals — all without requiring a custom backend.

![Tech Stack: React + Vite + Redux + Tailwind + Recharts](https://img.shields.io/badge/Stack-React%20%7C%20Vite%20%7C%20Redux-blue)

## 🚀 Features

- **📊 Real-time Stock Quotes** - Current price, daily high/low, volume, and change percentage
- **📈 Interactive OHLC Charts** - Multiple timeframes (1D, 5D, 1M, 3M, 1Y) with zoom and pan
- **🔍 Search & Autocomplete** - Smart search with keyboard navigation
- **📉 Technical Indicators** - SMA (50/200), RSI (14), MACD - all calculated client-side
- **💼 Fundamentals** - P/E, P/B, EPS, ROE, dividend yield, market cap
- **💰 Earnings Data** - Quarterly and annual EPS with surprise tracking
- **📖 Order Book** - Market depth visualization (simulated)
- **🌙 Dark Mode** - Automatic theme switching with localStorage persistence
- **🔗 Shareable URLs** - Direct links to specific stocks via URL params
- **💾 Smart Caching** - IndexedDB with TTL and localStorage fallback
- **♿ Accessible** - ARIA labels, keyboard navigation, semantic HTML

## 🏗️ Architecture

### Tech Stack
- **React 18** - UI library
- **Vite** - Build tool and dev server
- **Redux Toolkit** - State management
- **Tailwind CSS** - Styling
- **Recharts** - Lightweight charting
- **IndexedDB (idb)** - Client-side caching
- **Vitest + React Testing Library** - Testing

### API Strategy
The app attempts to fetch from multiple free APIs with automatic fallback:

1. **IndianAPI.in** (Primary) - Free Indian stock data
2. **Alpha Vantage** (Secondary) - Global quotes and fundamentals
3. **Mock Data** (Fallback) - Simulated data when APIs fail

#### CORS Handling
- Runtime CORS detection
- Automatic fallback to mock data
- Optional Vite dev proxy (see `vite.config.js`)
- Clear UI messaging about data source

## 📦 Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd indian-stock-market

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Edit .env.local with your API keys
# Get free key from: https://www.alphavantage.co/support/#api-key
```

### Environment Variables

```bash
# .env.local
VITE_ALPHA_VANTAGE_KEY=your_alpha_vantage_key
VITE_API_MODE=live  # or 'mock' to force mock data
VITE_USE_PROXY=false  # set to 'true' to enable Vite proxy
```

## 🚀 Running the App

```bash
# Development server (with HMR)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run tests
npm test

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage

# Lint code
npm run lint

# Run local mock server (optional)
npm run mock-server
```

The app will be available at `http://localhost:5173`

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run with coverage report
npm run test:coverage

# Open Vitest UI
npm run test:ui
```

Test files are located in:
- `src/components/__tests__/` - Component tests
- `src/utils/__tests__/` - Utility function tests
- `src/__tests__/` - Integration tests

## 📖 Usage

### Searching for Stocks
1. Type at least 2 characters in the search bar
2. Use arrow keys to navigate results
3. Press Enter or click to select
4. Use `.NS` suffix for NSE stocks (e.g., `RELIANCE.NS`)
5. Use `.BO` suffix for BSE stocks (e.g., `RELIANCE.BO`)

### Viewing Data
- **Quote Card** - Updates every 30 seconds
- **Charts** - Select timeframe buttons (1D/5D/1M/3M/1Y)
- **Indicators** - Toggle SMA and Volume overlays
- **Fundamentals** - Cached for 1 hour
- **Earnings** - Switch between Quarterly and Annual views

### Sharing Links
The URL automatically updates with the selected symbol:
```
https://your-domain.com/?symbol=RELIANCE.NS
```

## 🔧 CORS & API Limits

### Known Limitations

1. **Alpha Vantage Rate Limits**
   - Free tier: 5 API calls per minute
   - 500 calls per day
   - Client-side rate limiter handles throttling
   - Clear UI messages when limit reached

2. **CORS Restrictions**
   - Some APIs may block browser requests
   - App automatically falls back to mock data
   - See "Backend Proxy" section below for production solution

3. **IndianAPI.in**
   - Sometimes unreliable or rate-limited
   - No authentication required
   - May return incomplete data

### Development Proxy (Optional)

Enable the Vite proxy for local development:

```bash
# In .env.local
VITE_USE_PROXY=true
```

The proxy is configured in `vite.config.js` and will route requests through your dev server to bypass CORS.

### Mock Data Mode

Toggle mock data from the UI banner or set in `.env.local`:

```bash
VITE_API_MODE=mock
```

## 🔐 Security Considerations

**⚠️ IMPORTANT: API keys are exposed in frontend code**

This is inherent to a frontend-only app. For production:

1. **Rate limit concerns** - Free API keys can be abused
2. **Key exposure** - Anyone can view your API keys in browser
3. **CORS limitations** - Many APIs block browser requests

**Recommendation**: Add a serverless backend proxy (see below)

## 🚀 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard:
# VITE_ALPHA_VANTAGE_KEY=your_key
```

Or use the Vercel GitHub integration for automatic deployments.

### Netlify

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Build
npm run build

# Deploy
netlify deploy --prod

# Set environment variables in Netlify dashboard
```

Or drag and drop the `dist` folder to Netlify.

### Environment Variables

Set these in your hosting platform:
- `VITE_ALPHA_VANTAGE_KEY` - Your Alpha Vantage API key
- `VITE_API_MODE` - `live` or `mock`

## 🔌 Optional Backend Proxy

For production, consider adding a minimal serverless backend to:
- Hide API keys
- Handle rate limiting server-side
- Cache responses
- Add authentication

### Example: Vercel Serverless Function

Create `api/quote.js`:

```javascript
export default async function handler(req, res) {
  const { symbol } = req.query
  const API_KEY = process.env.ALPHA_VANTAGE_KEY
  
  try {
    const response = await fetch(
      `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${API_KEY}`
    )
    const data = await response.json()
    
    res.setHeader('Cache-Control', 's-maxage=60')
    res.json(data)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch quote' })
  }
}
```

Update `src/services/api.js` to use your endpoint:

```javascript
const response = await fetch(`/api/quote?symbol=${symbol}`)
```

### Example: Netlify Function

Create `netlify/functions/quote.js`:

```javascript
exports.handler = async (event) => {
  const { symbol } = event.queryStringParameters
  const API_KEY = process.env.ALPHA_VANTAGE_KEY
  
  try {
    const response = await fetch(
      `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${API_KEY}`
    )
    const data = await response.json()
    
    return {
      statusCode: 200,
      headers: { 'Cache-Control': 'public, max-age=60' },
      body: JSON.stringify(data),
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch quote' }),
    }
  }
}
```

## 📁 Project Structure

```
indian-stock-market/
├── public/              # Static assets
├── src/
│   ├── components/      # React components
│   │   ├── SearchBar.jsx
│   │   ├── QuoteCard.jsx
│   │   ├── OHLCChart.jsx
│   │   ├── FundamentalsPanel.jsx
│   │   ├── IndicatorsPanel.jsx
│   │   ├── OrderBook.jsx
│   │   ├── EarningsPanel.jsx
│   │   ├── Header.jsx
│   │   ├── ApiStatusBanner.jsx
│   │   ├── DemoDataPanel.jsx
│   │   ├── ErrorBoundary.jsx
│   │   └── __tests__/   # Component tests
│   ├── services/        # API services
│   │   ├── api.js       # Multi-source API fetcher
│   │   └── mockData.js  # Fallback mock data
│   ├── store/           # Redux store
│   │   ├── store.js
│   │   ├── stockSlice.js
│   │   └── apiSlice.js
│   ├── utils/           # Utility functions
│   │   ├── cache.js     # IndexedDB caching
│   │   ├── indicators.js # Technical indicators
│   │   └── __tests__/   # Utility tests
│   ├── App.jsx          # Main app component
│   ├── main.jsx         # Entry point
│   └── index.css        # Global styles
├── mock-data/           # JSON server data
├── .env.example         # Example environment variables
├── vite.config.js       # Vite configuration
├── tailwind.config.js   # Tailwind configuration
├── package.json
└── README.md
```

## 🎨 Customization

### Changing Theme Colors

Edit `tailwind.config.js`:

```javascript
theme: {
  extend: {
    colors: {
      primary: {
        // Your custom color palette
      },
    },
  },
}
```

### Adding New Indicators

1. Add calculation function to `src/utils/indicators.js`
2. Import and use in `src/components/IndicatorsPanel.jsx`
3. Add tests in `src/utils/__tests__/indicators.test.js`

### Adding New Data Sources

1. Create fetch function in `src/services/api.js`
2. Add fallback logic with try-catch
3. Update Redux slices if needed
4. Add to `ApiStatusBanner.jsx` for monitoring

## 🐛 Troubleshooting

### "Rate limit exceeded" message
- Wait 1 minute for Alpha Vantage limit to reset
- Switch to mock data mode temporarily
- Consider upgrading to Alpha Vantage premium

### Charts not loading
- Check browser console for errors
- Verify historical data is being fetched
- Try switching time ranges
- May be due to insufficient data points

### Search not working
- Ensure you're typing at least 2 characters
- Check API status banner for issues
- Try switching to mock data mode
- Check browser console for CORS errors

### Dark mode not persisting
- Check localStorage is enabled
- Clear browser cache and try again

## 📝 License

MIT License - feel free to use this project for learning or commercial purposes.

## 🙏 Acknowledgments

- **Alpha Vantage** - Free stock API
- **IndianAPI.in** - Indian stock data
- **Recharts** - React charting library
- **Tailwind CSS** - Utility-first CSS framework

## 📧 Support

For issues or questions:
1. Check this README
2. Review the code comments
3. Check browser console for errors
4. Open an issue on GitHub

---

**Note**: This app uses free public APIs and is intended for educational purposes. Data accuracy and availability are not guaranteed. Not financial advice.
