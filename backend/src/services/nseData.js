const yahooFinance = require("yahoo-finance2").default;
const logger = require("../utils/logger");

/**
 * Comprehensive list of NSE stocks
 */
const NSE_STOCKS = [
  // Banking & Financial Services
  {
    symbol: "HDFCBANK.NS",
    name: "HDFC Bank",
    sector: "Banking",
    industry: "Private Sector Bank",
  },
  {
    symbol: "ICICIBANK.NS",
    name: "ICICI Bank",
    sector: "Banking",
    industry: "Private Sector Bank",
  },
  {
    symbol: "SBIN.NS",
    name: "State Bank of India",
    sector: "Banking",
    industry: "Public Sector Bank",
  },
  {
    symbol: "KOTAKBANK.NS",
    name: "Kotak Mahindra Bank",
    sector: "Banking",
    industry: "Private Sector Bank",
  },
  {
    symbol: "AXISBANK.NS",
    name: "Axis Bank",
    sector: "Banking",
    industry: "Private Sector Bank",
  },
  {
    symbol: "BAJFINANCE.NS",
    name: "Bajaj Finance",
    sector: "Finance",
    industry: "NBFC",
  },
  {
    symbol: "BAJAJFINSV.NS",
    name: "Bajaj Finserv",
    sector: "Finance",
    industry: "Financial Services",
  },
  {
    symbol: "INDUSINDBK.NS",
    name: "IndusInd Bank",
    sector: "Banking",
    industry: "Private Sector Bank",
  },
  {
    symbol: "PNB.NS",
    name: "Punjab National Bank",
    sector: "Banking",
    industry: "Public Sector Bank",
  },
  {
    symbol: "BANKBARODA.NS",
    name: "Bank of Baroda",
    sector: "Banking",
    industry: "Public Sector Bank",
  },

  // IT Services
  {
    symbol: "TCS.NS",
    name: "Tata Consultancy Services",
    sector: "IT",
    industry: "IT Services",
  },
  { symbol: "INFY.NS", name: "Infosys", sector: "IT", industry: "IT Services" },
  { symbol: "WIPRO.NS", name: "Wipro", sector: "IT", industry: "IT Services" },
  {
    symbol: "HCLTECH.NS",
    name: "HCL Technologies",
    sector: "IT",
    industry: "IT Services",
  },
  {
    symbol: "TECHM.NS",
    name: "Tech Mahindra",
    sector: "IT",
    industry: "IT Services",
  },
  {
    symbol: "LTI.NS",
    name: "LTI Mindtree",
    sector: "IT",
    industry: "IT Services",
  },

  // Energy & Oil
  {
    symbol: "RELIANCE.NS",
    name: "Reliance Industries",
    sector: "Energy",
    industry: "Oil & Gas",
  },
  {
    symbol: "ONGC.NS",
    name: "Oil & Natural Gas Corporation",
    sector: "Energy",
    industry: "Oil & Gas",
  },
  {
    symbol: "BPCL.NS",
    name: "Bharat Petroleum",
    sector: "Energy",
    industry: "Oil & Gas",
  },
  {
    symbol: "IOC.NS",
    name: "Indian Oil Corporation",
    sector: "Energy",
    industry: "Oil & Gas",
  },
  {
    symbol: "ADANIGREEN.NS",
    name: "Adani Green Energy",
    sector: "Energy",
    industry: "Renewable Energy",
  },
  {
    symbol: "NTPC.NS",
    name: "NTPC",
    sector: "Energy",
    industry: "Power Generation",
  },
  {
    symbol: "POWERGRID.NS",
    name: "Power Grid Corporation",
    sector: "Energy",
    industry: "Power Transmission",
  },

  // Automobile
  {
    symbol: "TATAMOTORS.NS",
    name: "Tata Motors",
    sector: "Automobile",
    industry: "Auto Manufacturer",
  },
  {
    symbol: "M&M.NS",
    name: "Mahindra & Mahindra",
    sector: "Automobile",
    industry: "Auto Manufacturer",
  },
  {
    symbol: "MARUTI.NS",
    name: "Maruti Suzuki",
    sector: "Automobile",
    industry: "Auto Manufacturer",
  },
  {
    symbol: "BAJAJ-AUTO.NS",
    name: "Bajaj Auto",
    sector: "Automobile",
    industry: "Two Wheeler",
  },
  {
    symbol: "HEROMOTOCO.NS",
    name: "Hero MotoCorp",
    sector: "Automobile",
    industry: "Two Wheeler",
  },
  {
    symbol: "EICHERMOT.NS",
    name: "Eicher Motors",
    sector: "Automobile",
    industry: "Two Wheeler",
  },

  // FMCG
  {
    symbol: "HINDUNILVR.NS",
    name: "Hindustan Unilever",
    sector: "FMCG",
    industry: "Consumer Goods",
  },
  {
    symbol: "ITC.NS",
    name: "ITC Limited",
    sector: "FMCG",
    industry: "Diversified",
  },
  {
    symbol: "NESTLEIND.NS",
    name: "Nestle India",
    sector: "FMCG",
    industry: "Food Products",
  },
  {
    symbol: "BRITANNIA.NS",
    name: "Britannia Industries",
    sector: "FMCG",
    industry: "Food Products",
  },
  {
    symbol: "DABUR.NS",
    name: "Dabur India",
    sector: "FMCG",
    industry: "Personal Care",
  },
  {
    symbol: "GODREJCP.NS",
    name: "Godrej Consumer Products",
    sector: "FMCG",
    industry: "Consumer Goods",
  },

  // Telecom
  {
    symbol: "BHARTIARTL.NS",
    name: "Bharti Airtel",
    sector: "Telecom",
    industry: "Telecommunications",
  },
  {
    symbol: "IDEA.NS",
    name: "Vodafone Idea",
    sector: "Telecom",
    industry: "Telecommunications",
  },

  // Pharma
  {
    symbol: "SUNPHARMA.NS",
    name: "Sun Pharmaceutical",
    sector: "Pharma",
    industry: "Pharmaceuticals",
  },
  {
    symbol: "DRREDDY.NS",
    name: "Dr. Reddys Laboratories",
    sector: "Pharma",
    industry: "Pharmaceuticals",
  },
  {
    symbol: "CIPLA.NS",
    name: "Cipla",
    sector: "Pharma",
    industry: "Pharmaceuticals",
  },
  {
    symbol: "DIVISLAB.NS",
    name: "Divis Laboratories",
    sector: "Pharma",
    industry: "Pharmaceuticals",
  },
  {
    symbol: "BIOCON.NS",
    name: "Biocon",
    sector: "Pharma",
    industry: "Biotechnology",
  },

  // Metals & Mining
  {
    symbol: "TATASTEEL.NS",
    name: "Tata Steel",
    sector: "Metals",
    industry: "Steel",
  },
  {
    symbol: "HINDALCO.NS",
    name: "Hindalco Industries",
    sector: "Metals",
    industry: "Aluminum",
  },
  {
    symbol: "JSWSTEEL.NS",
    name: "JSW Steel",
    sector: "Metals",
    industry: "Steel",
  },
  {
    symbol: "COALINDIA.NS",
    name: "Coal India",
    sector: "Metals",
    industry: "Coal Mining",
  },
  {
    symbol: "VEDL.NS",
    name: "Vedanta",
    sector: "Metals",
    industry: "Mining & Minerals",
  },

  // Infrastructure & Construction
  {
    symbol: "LT.NS",
    name: "Larsen & Toubro",
    sector: "Infrastructure",
    industry: "Construction",
  },
  {
    symbol: "ULTRACEMCO.NS",
    name: "UltraTech Cement",
    sector: "Infrastructure",
    industry: "Cement",
  },
  {
    symbol: "GRASIM.NS",
    name: "Grasim Industries",
    sector: "Infrastructure",
    industry: "Cement",
  },
  {
    symbol: "ADANIPORTS.NS",
    name: "Adani Ports",
    sector: "Infrastructure",
    industry: "Ports",
  },

  // Retail & E-commerce
  {
    symbol: "TRENT.NS",
    name: "Trent",
    sector: "Retail",
    industry: "Fashion Retail",
  },
  {
    symbol: "DMART.NS",
    name: "Avenue Supermarts (DMart)",
    sector: "Retail",
    industry: "Supermarket",
  },

  // Others
  {
    symbol: "TITAN.NS",
    name: "Titan Company",
    sector: "Consumer Goods",
    industry: "Jewelry & Watches",
  },
  {
    symbol: "ASIANPAINT.NS",
    name: "Asian Paints",
    sector: "Consumer Goods",
    industry: "Paints",
  },
  {
    symbol: "SHREECEM.NS",
    name: "Shree Cement",
    sector: "Infrastructure",
    industry: "Cement",
  },
  {
    symbol: "ADANIENT.NS",
    name: "Adani Enterprises",
    sector: "Diversified",
    industry: "Conglomerate",
  },
];

/**
 * Fetch real-time quote for a stock
 */
async function fetchRealTimeQuote(symbol) {
  try {
    const quote = await yahooFinance.quote(symbol);
    return {
      symbol: quote.symbol,
      name: quote.longName || quote.shortName,
      price: quote.regularMarketPrice,
      change: quote.regularMarketChange,
      changePercent: quote.regularMarketChangePercent,
      open: quote.regularMarketOpen,
      high: quote.regularMarketDayHigh,
      low: quote.regularMarketDayLow,
      volume: quote.regularMarketVolume,
      previousClose: quote.regularMarketPreviousClose,
      marketCap: quote.marketCap,
      week52High: quote.fiftyTwoWeekHigh,
      week52Low: quote.fiftyTwoWeekLow,
      avgVolume: quote.averageDailyVolume3Month,
      pe: quote.trailingPE,
      eps: quote.epsTrailingTwelveMonths,
      dividendYield: quote.dividendYield,
      beta: quote.beta,
    };
  } catch (error) {
    logger.error(`Failed to fetch quote for ${symbol}:`, error.message);
    throw error;
  }
}

/**
 * Fetch comprehensive stock details
 */
async function fetchStockDetails(symbol) {
  try {
    const [quote, summaryDetail, financialData, defaultKeyStatistics] =
      await Promise.all([
        yahooFinance.quote(symbol),
        yahooFinance.quoteSummary(symbol, { modules: ["summaryDetail"] }),
        yahooFinance.quoteSummary(symbol, { modules: ["financialData"] }),
        yahooFinance.quoteSummary(symbol, {
          modules: ["defaultKeyStatistics"],
        }),
      ]);

    return {
      quote,
      summaryDetail: summaryDetail.summaryDetail,
      financialData: financialData.financialData,
      keyStatistics: defaultKeyStatistics.defaultKeyStatistics,
    };
  } catch (error) {
    logger.error(`Failed to fetch details for ${symbol}:`, error.message);
    throw error;
  }
}

/**
 * Fetch historical chart data
 */
async function fetchChartData(symbol, period = "1y", interval = "1d") {
  try {
    const endDate = new Date();
    const startDate = new Date();

    // Set start date based on period
    switch (period) {
      case "1d":
        startDate.setDate(startDate.getDate() - 1);
        break;
      case "5d":
        startDate.setDate(startDate.getDate() - 5);
        break;
      case "1m":
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case "3m":
        startDate.setMonth(startDate.getMonth() - 3);
        break;
      case "6m":
        startDate.setMonth(startDate.getMonth() - 6);
        break;
      case "1y":
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      case "5y":
        startDate.setFullYear(startDate.getFullYear() - 5);
        break;
      default:
        startDate.setFullYear(startDate.getFullYear() - 1);
    }

    const result = await yahooFinance.chart(symbol, {
      period1: startDate,
      period2: endDate,
      interval: interval,
    });

    return result.quotes.map((quote) => ({
      date: quote.date,
      open: quote.open,
      high: quote.high,
      low: quote.low,
      close: quote.close,
      volume: quote.volume,
    }));
  } catch (error) {
    logger.error(`Failed to fetch chart data for ${symbol}:`, error.message);
    throw error;
  }
}

/**
 * Get all NSE stocks list
 */
function getAllNSEStocks() {
  return NSE_STOCKS;
}

/**
 * Search stocks by name or symbol
 */
function searchStocks(query) {
  const lowerQuery = query.toLowerCase();
  return NSE_STOCKS.filter(
    (stock) =>
      stock.name.toLowerCase().includes(lowerQuery) ||
      stock.symbol.toLowerCase().includes(lowerQuery) ||
      stock.industry.toLowerCase().includes(lowerQuery),
  );
}

/**
 * Get unique sectors
 */
function getSectors() {
  return [...new Set(NSE_STOCKS.map((stock) => stock.sector))].sort();
}

/**
 * Get stocks by sector
 */
function getStocksBySector(sector) {
  return NSE_STOCKS.filter((stock) => stock.sector === sector);
}

module.exports = {
  NSE_STOCKS,
  fetchRealTimeQuote,
  fetchStockDetails,
  fetchChartData,
  getAllNSEStocks,
  searchStocks,
  getSectors,
  getStocksBySector,
};
