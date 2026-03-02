import { setCache, getCache } from "../utils/cache";
import { setApiStatus } from "../store/apiSlice";
import {
  mockQuoteData,
  mockHistoricalData,
  mockFundamentals,
  mockEarnings,
} from "./mockData";

console.log(import.meta.env.ALPHA_VANTAGE_KEY);
const ALPHA_VANTAGE_KEY = import.meta.env.VITE_ALPHA_VANTAGE_KEY || "demo";
const USE_PROXY = import.meta.env.VITE_USE_PROXY === "true";

// Rate limiter for Alpha Vantage (5 calls per minute)
class RateLimiter {
  constructor(maxCalls = 5, intervalMs = 60000) {
    this.maxCalls = maxCalls;
    this.intervalMs = intervalMs;
    this.calls = [];
  }

  async throttle() {
    const now = Date.now();
    this.calls = this.calls.filter((time) => now - time < this.intervalMs);

    if (this.calls.length >= this.maxCalls) {
      const oldestCall = this.calls[0];
      const waitTime = this.intervalMs - (now - oldestCall);
      console.log(
        `Rate limit reached. Waiting ${Math.ceil(waitTime / 1000)}s...`
      );
      await new Promise((resolve) => setTimeout(resolve, waitTime + 100));
      return this.throttle();
    }

    this.calls.push(now);
  }

  getRemaining() {
    const now = Date.now();
    this.calls = this.calls.filter((time) => now - time < this.intervalMs);
    return this.maxCalls - this.calls.length;
  }
}

const alphaVantageRateLimiter = new RateLimiter(5, 60000);

/**
 * Detect if a fetch request fails due to CORS
 */
async function detectCORS(url, options = {}) {
  try {
    const response = await fetch(url, { ...options, method: "HEAD" });
    return response.ok;
  } catch (error) {
    if (error.message.includes("CORS") || error.name === "TypeError") {
      return false;
    }
    return true;
  }
}

/**
 * Fetch with timeout and abort controller
 */
async function fetchWithTimeout(url, options = {}, timeout = 10000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

/**
 * Fetch stock quote from multiple sources with fallback
 */
export async function fetchQuote(symbol, dispatch, useMock = false) {
  if (useMock) {
    return mockQuoteData(symbol);
  }

  const cacheKey = `quote_${symbol}`;
  const cached = await getCache(cacheKey);
  if (cached) {
    console.log("Using cached quote data");
    return cached;
  }

  // Try Indian API first
  try {
    const quote = await fetchIndianAPIQuote(symbol, dispatch);
    if (quote) {
      await setCache(cacheKey, quote, 1); // Cache for 1 minute
      return quote;
    }
  } catch (error) {
    console.warn("Indian API failed:", error.message);
  }

  // Try Alpha Vantage
  try {
    const quote = await fetchAlphaVantageQuote(symbol, dispatch);
    if (quote) {
      await setCache(cacheKey, quote, 1);
      return quote;
    }
  } catch (error) {
    console.warn("Alpha Vantage failed:", error.message);
  }

  // Fallback to mock
  console.log("All APIs failed, using mock data");
  return mockQuoteData(symbol);
}

/**
 * Fetch from Indian API
 */
async function fetchIndianAPIQuote(symbol, dispatch) {
  const cleanSymbol = symbol.replace(".NS", "").replace(".BO", "");
  const url = `https://api.indianapi.in/nse/stock/${cleanSymbol}`;

  try {
    const response = await fetchWithTimeout(url, {}, 8000);

    if (!response.ok) {
      dispatch(setApiStatus({ api: "indianapi", status: "error" }));
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    dispatch(setApiStatus({ api: "indianapi", status: "success" }));

    return {
      symbol: symbol,
      name: data.companyName || symbol,
      price: parseFloat(data.lastPrice || data.ltp || 0),
      change: parseFloat(data.change || 0),
      changePercent: parseFloat(data.pChange || 0),
      open: parseFloat(data.open || 0),
      high: parseFloat(data.dayHigh || 0),
      low: parseFloat(data.dayLow || 0),
      previousClose: parseFloat(data.previousClose || 0),
      volume: parseInt(data.totalTradedVolume || 0),
      avgVolume: parseInt(data.averageVolume || 0),
      timestamp: new Date().toISOString(),
      source: "indianapi",
    };
  } catch (error) {
    dispatch(setApiStatus({ api: "indianapi", status: "error" }));
    throw error;
  }
}

/**
 * Fetch from Alpha Vantage
 */
async function fetchAlphaVantageQuote(symbol, dispatch) {
  await alphaVantageRateLimiter.throttle();

  const cleanSymbol = symbol.replace(".NS", ".BSE").replace(".BO", ".BSE");
  const baseUrl = USE_PROXY
    ? "/api/alphavantage"
    : "https://www.alphavantage.co/query";
  const url = `${baseUrl}?function=GLOBAL_QUOTE&symbol=${cleanSymbol}&apikey=${ALPHA_VANTAGE_KEY}`;

  try {
    const response = await fetchWithTimeout(url, {}, 10000);

    if (!response.ok) {
      dispatch(setApiStatus({ api: "alphavantage", status: "error" }));
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    if (data["Note"]) {
      dispatch(setApiStatus({ api: "alphavantage", status: "rate-limited" }));
      throw new Error("Rate limit exceeded");
    }

    const quote = data["Global Quote"];
    if (!quote || !quote["05. price"]) {
      throw new Error("Invalid response");
    }

    dispatch(setApiStatus({ api: "alphavantage", status: "success" }));

    return {
      symbol: symbol,
      name: symbol,
      price: parseFloat(quote["05. price"]),
      change: parseFloat(quote["09. change"]),
      changePercent: parseFloat(quote["10. change percent"].replace("%", "")),
      open: parseFloat(quote["02. open"]),
      high: parseFloat(quote["03. high"]),
      low: parseFloat(quote["04. low"]),
      previousClose: parseFloat(quote["08. previous close"]),
      volume: parseInt(quote["06. volume"]),
      avgVolume: 0,
      timestamp: quote["07. latest trading day"],
      source: "alphavantage",
    };
  } catch (error) {
    if (error.message.includes("Rate limit")) {
      dispatch(setApiStatus({ api: "alphavantage", status: "rate-limited" }));
    } else {
      dispatch(setApiStatus({ api: "alphavantage", status: "error" }));
    }
    throw error;
  }
}

/**
 * Fetch historical OHLC data
 */
export async function fetchHistoricalData(
  symbol,
  range = "1M",
  dispatch,
  useMock = false
) {
  if (useMock) {
    return mockHistoricalData(symbol, range);
  }

  const cacheKey = `historical_${symbol}_${range}`;
  const cached = await getCache(cacheKey);
  if (cached) {
    console.log("Using cached historical data");
    return cached;
  }

  // Try Alpha Vantage
  try {
    await alphaVantageRateLimiter.throttle();

    const functionMap = {
      "1D": "TIME_SERIES_INTRADAY",
      "5D": "TIME_SERIES_DAILY",
      "1M": "TIME_SERIES_DAILY",
      "3M": "TIME_SERIES_DAILY",
      "1Y": "TIME_SERIES_DAILY",
    };

    const func = functionMap[range] || "TIME_SERIES_DAILY";
    const cleanSymbol = symbol.replace(".NS", ".BSE").replace(".BO", ".BSE");
    const baseUrl = USE_PROXY
      ? "/api/alphavantage"
      : "https://www.alphavantage.co/query";

    let url = `${baseUrl}?function=${func}&symbol=${cleanSymbol}&apikey=${ALPHA_VANTAGE_KEY}`;
    if (func === "TIME_SERIES_INTRADAY") {
      url += "&interval=5min&outputsize=full";
    } else {
      url += "&outputsize=full";
    }

    const response = await fetchWithTimeout(url, {}, 15000);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    if (data["Note"]) {
      throw new Error("Rate limit exceeded");
    }

    const timeSeriesKey = Object.keys(data).find((key) =>
      key.includes("Time Series")
    );
    if (!timeSeriesKey) {
      throw new Error("Invalid response format");
    }

    const timeSeries = data[timeSeriesKey];
    const historical = Object.entries(timeSeries)
      .map(([date, values]) => ({
        date,
        open: parseFloat(values["1. open"]),
        high: parseFloat(values["2. high"]),
        low: parseFloat(values["3. low"]),
        close: parseFloat(values["4. close"]),
        volume: parseInt(values["5. volume"]),
      }))
      .reverse();

    // Filter by range
    const filtered = filterByRange(historical, range);

    await setCache(cacheKey, filtered, 5);
    return filtered;
  } catch (error) {
    console.warn("Alpha Vantage historical data failed:", error.message);
  }

  // Fallback to mock
  console.log("Using mock historical data");
  return mockHistoricalData(symbol, range);
}

/**
 * Filter historical data by date range
 */
function filterByRange(data, range) {
  const now = new Date();
  const cutoff = new Date();

  switch (range) {
    case "1D":
      cutoff.setHours(cutoff.getHours() - 24);
      break;
    case "5D":
      cutoff.setDate(cutoff.getDate() - 5);
      break;
    case "1M":
      cutoff.setMonth(cutoff.getMonth() - 1);
      break;
    case "3M":
      cutoff.setMonth(cutoff.getMonth() - 3);
      break;
    case "1Y":
      cutoff.setFullYear(cutoff.getFullYear() - 1);
      break;
    default:
      return data;
  }

  return data.filter((item) => new Date(item.date) >= cutoff);
}

/**
 * Fetch fundamentals data
 */
export async function fetchFundamentals(symbol, dispatch, useMock = false) {
  if (useMock) {
    return mockFundamentals(symbol);
  }

  const cacheKey = `fundamentals_${symbol}`;
  const cached = await getCache(cacheKey);
  if (cached) {
    console.log("Using cached fundamentals");
    return cached;
  }

  // Try Alpha Vantage Overview
  try {
    await alphaVantageRateLimiter.throttle();

    const cleanSymbol = symbol.replace(".NS", ".BSE").replace(".BO", ".BSE");
    const baseUrl = USE_PROXY
      ? "/api/alphavantage"
      : "https://www.alphavantage.co/query";
    const url = `${baseUrl}?function=OVERVIEW&symbol=${cleanSymbol}&apikey=${ALPHA_VANTAGE_KEY}`;

    const response = await fetchWithTimeout(url, {}, 10000);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    if (data["Note"]) {
      throw new Error("Rate limit exceeded");
    }

    if (!data.Symbol) {
      throw new Error("No data available");
    }

    const fundamentals = {
      marketCap: parseFloat(data.MarketCapitalization) || 0,
      pe: parseFloat(data.PERatio) || 0,
      pb: parseFloat(data.PriceToBookRatio) || 0,
      eps: parseFloat(data.EPS) || 0,
      dividendYield: parseFloat(data.DividendYield) * 100 || 0,
      roe: parseFloat(data.ReturnOnEquityTTM) * 100 || 0,
      revenue: parseFloat(data.RevenueTTM) || 0,
      profitMargin: parseFloat(data.ProfitMargin) * 100 || 0,
      beta: parseFloat(data.Beta) || 0,
      week52High: parseFloat(data["52WeekHigh"]) || 0,
      week52Low: parseFloat(data["52WeekLow"]) || 0,
      sharesOutstanding: parseFloat(data.SharesOutstanding) || 0,
      sector: data.Sector || "N/A",
      industry: data.Industry || "N/A",
      description: data.Description || "",
      source: "alphavantage",
    };

    await setCache(cacheKey, fundamentals, 60); // Cache for 1 hour
    return fundamentals;
  } catch (error) {
    console.warn("Fundamentals fetch failed:", error.message);
  }

  // Fallback to mock
  return mockFundamentals(symbol);
}

/**
 * Fetch earnings data
 */
export async function fetchEarnings(symbol, dispatch, useMock = false) {
  if (useMock) {
    return mockEarnings(symbol);
  }

  const cacheKey = `earnings_${symbol}`;
  const cached = await getCache(cacheKey);
  if (cached) {
    console.log("Using cached earnings");
    return cached;
  }

  // Try Alpha Vantage Earnings
  try {
    await alphaVantageRateLimiter.throttle();

    const cleanSymbol = symbol.replace(".NS", ".BSE").replace(".BO", ".BSE");
    const baseUrl = USE_PROXY
      ? "/api/alphavantage"
      : "https://www.alphavantage.co/query";
    const url = `${baseUrl}?function=EARNINGS&symbol=${cleanSymbol}&apikey=${ALPHA_VANTAGE_KEY}`;

    const response = await fetchWithTimeout(url, {}, 10000);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    if (data["Note"]) {
      throw new Error("Rate limit exceeded");
    }

    const earnings = {
      quarterly: (data.quarterlyEarnings || []).slice(0, 8).map((q) => ({
        date: q.fiscalDateEnding,
        reportedEPS: parseFloat(q.reportedEPS) || 0,
        estimatedEPS: parseFloat(q.estimatedEPS) || 0,
        surprise: parseFloat(q.surprise) || 0,
        surprisePercent: parseFloat(q.surprisePercentage) || 0,
      })),
      annual: (data.annualEarnings || []).slice(0, 5).map((a) => ({
        fiscalYear: a.fiscalDateEnding,
        reportedEPS: parseFloat(a.reportedEPS) || 0,
      })),
      source: "alphavantage",
    };

    await setCache(cacheKey, earnings, 120); // Cache for 2 hours
    return earnings;
  } catch (error) {
    console.warn("Earnings fetch failed:", error.message);
  }

  // Fallback to mock
  return mockEarnings(symbol);
}

/**
 * Search for stock symbols
 */
export async function searchSymbols(query, dispatch, useMock = false) {
  if (!query || query.length < 2) return [];

  if (useMock) {
    const mockSymbols = [
      { symbol: "RELIANCE.NS", name: "Reliance Industries Ltd" },
      { symbol: "TCS.NS", name: "Tata Consultancy Services Ltd" },
      { symbol: "INFY.NS", name: "Infosys Ltd" },
      { symbol: "HDFCBANK.NS", name: "HDFC Bank Ltd" },
      { symbol: "ICICIBANK.NS", name: "ICICI Bank Ltd" },
    ];
    return mockSymbols.filter(
      (s) =>
        s.symbol.toLowerCase().includes(query.toLowerCase()) ||
        s.name.toLowerCase().includes(query.toLowerCase())
    );
  }

  // Try Alpha Vantage Search
  try {
    await alphaVantageRateLimiter.throttle();

    const baseUrl = USE_PROXY
      ? "/api/alphavantage"
      : "https://www.alphavantage.co/query";
    const url = `${baseUrl}?function=SYMBOL_SEARCH&keywords=${query}&apikey=${ALPHA_VANTAGE_KEY}`;

    const response = await fetchWithTimeout(url, {}, 8000);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    if (data["Note"]) {
      throw new Error("Rate limit exceeded");
    }

    const matches = data.bestMatches || [];
    return matches
      .filter((match) => match["4. region"] === "India")
      .map((match) => ({
        symbol: match["1. symbol"],
        name: match["2. name"],
        type: match["3. type"],
        region: match["4. region"],
      }))
      .slice(0, 10);
  } catch (error) {
    console.warn("Symbol search failed:", error.message);

    // Return common Indian stocks as fallback
    const commonStocks = [
      { symbol: "RELIANCE.NS", name: "Reliance Industries Ltd" },
      { symbol: "TCS.NS", name: "Tata Consultancy Services Ltd" },
      { symbol: "INFY.NS", name: "Infosys Ltd" },
      { symbol: "HDFCBANK.NS", name: "HDFC Bank Ltd" },
      { symbol: "ICICIBANK.NS", name: "ICICI Bank Ltd" },
      { symbol: "HINDUNILVR.NS", name: "Hindustan Unilever Ltd" },
      { symbol: "BHARTIARTL.NS", name: "Bharti Airtel Ltd" },
      { symbol: "ITC.NS", name: "ITC Ltd" },
      { symbol: "SBIN.NS", name: "State Bank of India" },
      { symbol: "WIPRO.NS", name: "Wipro Ltd" },
    ];

    return commonStocks.filter(
      (s) =>
        s.symbol.toLowerCase().includes(query.toLowerCase()) ||
        s.name.toLowerCase().includes(query.toLowerCase())
    );
  }
}
