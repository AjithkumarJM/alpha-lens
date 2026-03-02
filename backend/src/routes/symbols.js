const express = require("express");
const router = express.Router();
const logger = require("../utils/logger");

// Stock database with comprehensive details
const STOCKS_DATABASE = [
  {
    symbol: "RELIANCE.NS",
    name: "Reliance Industries",
    sector: "Energy",
    industry: "Oil & Gas",
  },
  {
    symbol: "TCS.NS",
    name: "Tata Consultancy Services",
    sector: "IT",
    industry: "IT Services",
  },
  { symbol: "INFY.NS", name: "Infosys", sector: "IT", industry: "IT Services" },
  {
    symbol: "HDFCBANK.NS",
    name: "HDFC Bank",
    sector: "Banking",
    industry: "Private Bank",
  },
  {
    symbol: "ICICIBANK.NS",
    name: "ICICI Bank",
    sector: "Banking",
    industry: "Private Bank",
  },
  {
    symbol: "HINDUNILVR.NS",
    name: "Hindustan Unilever",
    sector: "FMCG",
    industry: "Consumer Goods",
  },
  {
    symbol: "BHARTIARTL.NS",
    name: "Bharti Airtel",
    sector: "Telecom",
    industry: "Telecom Services",
  },
  {
    symbol: "SBIN.NS",
    name: "State Bank of India",
    sector: "Banking",
    industry: "Public Bank",
  },
  {
    symbol: "BAJFINANCE.NS",
    name: "Bajaj Finance",
    sector: "Finance",
    industry: "NBFC",
  },
  {
    symbol: "TATAMOTORS.NS",
    name: "Tata Motors",
    sector: "Automobile",
    industry: "Auto Manufacturer",
  },
  {
    symbol: "ITC.NS",
    name: "ITC Limited",
    sector: "FMCG",
    industry: "Diversified",
  },
  {
    symbol: "LT.NS",
    name: "Larsen & Toubro",
    sector: "Infrastructure",
    industry: "Engineering",
  },
  {
    symbol: "KOTAKBANK.NS",
    name: "Kotak Mahindra Bank",
    sector: "Banking",
    industry: "Private Bank",
  },
  {
    symbol: "AXISBANK.NS",
    name: "Axis Bank",
    sector: "Banking",
    industry: "Private Bank",
  },
  { symbol: "WIPRO.NS", name: "Wipro", sector: "IT", industry: "IT Services" },
  {
    symbol: "MARUTI.NS",
    name: "Maruti Suzuki",
    sector: "Automobile",
    industry: "Auto Manufacturer",
  },
  {
    symbol: "SUNPHARMA.NS",
    name: "Sun Pharma",
    sector: "Pharma",
    industry: "Pharmaceuticals",
  },
  {
    symbol: "ULTRACEMCO.NS",
    name: "UltraTech Cement",
    sector: "Cement",
    industry: "Building Materials",
  },
  {
    symbol: "TITAN.NS",
    name: "Titan Company",
    sector: "Consumer Goods",
    industry: "Jewelry & Watches",
  },
  {
    symbol: "NESTLEIND.NS",
    name: "Nestle India",
    sector: "FMCG",
    industry: "Food Products",
  },
  {
    symbol: "TECHM.NS",
    name: "Tech Mahindra",
    sector: "IT",
    industry: "IT Services",
  },
  {
    symbol: "HCLTECH.NS",
    name: "HCL Technologies",
    sector: "IT",
    industry: "IT Services",
  },
  {
    symbol: "POWERGRID.NS",
    name: "Power Grid Corp",
    sector: "Power",
    industry: "Utilities",
  },
  {
    symbol: "NTPC.NS",
    name: "NTPC",
    sector: "Power",
    industry: "Power Generation",
  },
  {
    symbol: "ASIANPAINT.NS",
    name: "Asian Paints",
    sector: "Consumer Goods",
    industry: "Paints",
  },
  {
    symbol: "BAJAJFINSV.NS",
    name: "Bajaj Finserv",
    sector: "Finance",
    industry: "Financial Services",
  },
  {
    symbol: "DIVISLAB.NS",
    name: "Divi's Laboratories",
    sector: "Pharma",
    industry: "Pharmaceuticals",
  },
  {
    symbol: "ADANIPORTS.NS",
    name: "Adani Ports",
    sector: "Infrastructure",
    industry: "Ports",
  },
  { symbol: "ONGC.NS", name: "ONGC", sector: "Energy", industry: "Oil & Gas" },
  {
    symbol: "COALINDIA.NS",
    name: "Coal India",
    sector: "Mining",
    industry: "Coal Mining",
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
    symbol: "TATASTEEL.NS",
    name: "Tata Steel",
    sector: "Metals",
    industry: "Steel",
  },
  {
    symbol: "INDUSINDBK.NS",
    name: "IndusInd Bank",
    sector: "Banking",
    industry: "Private Bank",
  },
  {
    symbol: "CIPLA.NS",
    name: "Cipla",
    sector: "Pharma",
    industry: "Pharmaceuticals",
  },
  {
    symbol: "DRREDDY.NS",
    name: "Dr Reddy's Labs",
    sector: "Pharma",
    industry: "Pharmaceuticals",
  },
  {
    symbol: "EICHERMOT.NS",
    name: "Eicher Motors",
    sector: "Automobile",
    industry: "Two Wheelers",
  },
  {
    symbol: "HEROMOTOCO.NS",
    name: "Hero MotoCorp",
    sector: "Automobile",
    industry: "Two Wheelers",
  },
  {
    symbol: "GRASIM.NS",
    name: "Grasim Industries",
    sector: "Diversified",
    industry: "Cement & Textiles",
  },
  {
    symbol: "BRITANNIA.NS",
    name: "Britannia Industries",
    sector: "FMCG",
    industry: "Food Products",
  },
  {
    symbol: "BPCL.NS",
    name: "Bharat Petroleum",
    sector: "Energy",
    industry: "Oil Refining",
  },
  {
    symbol: "SHREECEM.NS",
    name: "Shree Cement",
    sector: "Cement",
    industry: "Building Materials",
  },
  {
    symbol: "UPL.NS",
    name: "UPL Limited",
    sector: "Chemicals",
    industry: "Agrochemicals",
  },
  {
    symbol: "APOLLOHOSP.NS",
    name: "Apollo Hospitals",
    sector: "Healthcare",
    industry: "Hospitals",
  },
  {
    symbol: "M&M.NS",
    name: "Mahindra & Mahindra",
    sector: "Automobile",
    industry: "Auto Manufacturer",
  },
];

/**
 * GET /api/symbols/search?q=query
 * Search stocks by name or symbol
 */
router.get("/search", (req, res) => {
  const query = req.query.q?.toLowerCase() || "";

  if (!query || query.length < 2) {
    return res.json({ results: [] });
  }

  const results = STOCKS_DATABASE.filter(
    (stock) =>
      stock.name.toLowerCase().includes(query) ||
      stock.symbol.toLowerCase().includes(query) ||
      stock.sector.toLowerCase().includes(query),
  ).slice(0, 10);

  res.json({ results });
});

/**
 * GET /api/symbols
 * Get all stocks
 */
router.get("/", (req, res) => {
  res.json({
    stocks: STOCKS_DATABASE,
    count: STOCKS_DATABASE.length,
  });
});

/**
 * GET /api/symbols/sectors
 * Get all unique sectors
 */
router.get("/sectors", (req, res) => {
  const sectors = [...new Set(STOCKS_DATABASE.map((s) => s.sector))];
  res.json({ sectors });
});

/**
 * GET /api/symbols/sector/:sector
 * Get stocks by sector
 */
router.get("/sector/:sector", (req, res) => {
  const { sector } = req.params;
  const stocks = STOCKS_DATABASE.filter(
    (s) => s.sector.toLowerCase() === sector.toLowerCase(),
  );

  res.json({
    sector,
    stocks,
    count: stocks.length,
  });
});

module.exports = router;
