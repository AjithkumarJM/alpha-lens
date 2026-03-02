const logger = require("../utils/logger");
const { fetchHistoricalData } = require("./yahooFinance");
const { generateSignal } = require("./signalGenerator");

// Default symbols to analyze daily
const DEFAULT_SYMBOLS = [
  "RELIANCE.NS",
  "TCS.NS",
  "INFY.NS",
  "HDFCBANK.NS",
  "ICICIBANK.NS",
  "HINDUNILVR.NS",
  "BHARTIARTL.NS",
  "SBIN.NS",
  "BAJFINANCE.NS",
  "TATAMOTORS.NS",
  "ITC.NS",
  "LT.NS",
  "KOTAKBANK.NS",
  "AXISBANK.NS",
  "WIPRO.NS",
  "MARUTI.NS",
  "SUNPHARMA.NS",
  "ULTRACEMCO.NS",
  "TITAN.NS",
  "NESTLEIND.NS",
  "TECHM.NS",
  "HCLTECH.NS",
  "POWERGRID.NS",
  "NTPC.NS",
  "ASIANPAINT.NS",
  "BAJAJFINSV.NS",
  "DIVISLAB.NS",
  "ADANIPORTS.NS",
  "ONGC.NS",
  "COALINDIA.NS",
  "HINDALCO.NS",
  "JSWSTEEL.NS",
  "TATASTEEL.NS",
  "INDUSINDBK.NS",
  "CIPLA.NS",
  "DRREDDY.NS",
  "EICHERMOT.NS",
  "HEROMOTOCO.NS",
  "GRASIM.NS",
  "BRITANNIA.NS",
  "BPCL.NS",
  "SHREECEM.NS",
  "UPL.NS",
  "APOLLOHOSP.NS",
  "M&M.NS",
];

/**
 * Run daily analysis for all symbols
 */
async function runDailyAnalysis() {
  logger.info("Starting daily analysis run...");
  const startTime = Date.now();

  const results = [];

  for (const symbol of DEFAULT_SYMBOLS) {
    try {
      logger.info(`Analyzing ${symbol}...`);

      const historicalData = await fetchHistoricalData(symbol, 200);
      const analysis = generateSignal(symbol, historicalData);

      results.push({
        symbol,
        signal: analysis.signal,
        confidence: analysis.confidence,
        score: analysis.score,
      });

      // Stagger requests to avoid rate limits (10 second delay)
      await new Promise((resolve) => setTimeout(resolve, 10000));
    } catch (error) {
      logger.error(`Failed to analyze ${symbol}:`, error.message);
    }
  }

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  logger.info(
    `Daily analysis completed in ${duration}s. Analyzed ${results.length}/${DEFAULT_SYMBOLS.length} symbols`,
  );

  // Log high-confidence BUY signals
  const buySignals = results.filter(
    (r) => r.signal === "BUY" && r.confidence === "HIGH",
  );
  if (buySignals.length > 0) {
    logger.info(
      `High-confidence BUY signals: ${buySignals.map((s) => s.symbol).join(", ")}`,
    );
  }

  return results;
}

module.exports = {
  runDailyAnalysis,
};
