import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import SignalCard from "../components/SignalCard";
import MetricsTable from "../components/MetricsTable";
import { fetchAnalysis, addToWatchlist } from "../services/api";
import "./SymbolAnalysis.css";

const SymbolAnalysis = () => {
  const { symbol } = useParams();
  const navigate = useNavigate();
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const loadAnalysis = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetchAnalysis(symbol);
        setAnalysis(response.data);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            err.message ||
            "Failed to load analysis",
        );
      } finally {
        setLoading(false);
      }
    };

    loadAnalysis();
  }, [symbol]);

  const handleAddToWatchlist = async () => {
    try {
      await addToWatchlist(symbol);
      alert(`${symbol} added to watchlist`);
    } catch (err) {
      alert("Failed to add to watchlist");
    }
  };

  if (loading) {
    return (
      <div className="symbol-analysis">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading comprehensive analysis for {symbol}...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="symbol-analysis">
        <div className="error">
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={() => navigate("/")}>Back to Dashboard</button>
        </div>
      </div>
    );
  }

  const getStockImage = () => {
    // Placeholder image logic - in production, use actual stock logos
    return `https://ui-avatars.com/api/?name=${analysis.name}&size=120&background=5f27cd&color=fff&bold=true`;
  };

  return (
    <div className="symbol-analysis">
      {/* Stock Header */}
      <header className="symbol-header">
        <div className="header-left">
          <img
            src={getStockImage()}
            alt={analysis.name}
            className="stock-logo"
          />
          <div className="symbol-info">
            <h1>{analysis.name}</h1>
            <p className="symbol-code">{analysis.symbol}</p>
            <span className="sector-badge">
              {analysis.about?.industry || "N/A"}
            </span>
          </div>
        </div>
        <div className="header-right">
          <div className="price-info">
            <span className="current-price">
              ₹{analysis.price.current.toLocaleString("en-IN")}
            </span>
            <span
              className={analysis.price.change > 0 ? "positive" : "negative"}
            >
              {analysis.price.change > 0 ? "+" : ""}₹{analysis.price.change} (
              {analysis.price.changePercent}%)
            </span>
          </div>
          <button className="btn-watchlist" onClick={handleAddToWatchlist}>
            ⭐ Add to Watchlist
          </button>
        </div>
      </header>

      {/* Performance Summary */}
      <div className="performance-summary">
        <div className="perf-item">
          <span className="label">Open</span>
          <span className="value">
            ₹{analysis.performance?.open.toLocaleString("en-IN")}
          </span>
        </div>
        <div className="perf-item">
          <span className="label">Day High</span>
          <span className="value">
            ₹{analysis.performance?.dayHigh.toLocaleString("en-IN")}
          </span>
        </div>
        <div className="perf-item">
          <span className="label">Day Low</span>
          <span className="value">
            ₹{analysis.performance?.dayLow.toLocaleString("en-IN")}
          </span>
        </div>
        <div className="perf-item">
          <span className="label">52W High</span>
          <span className="value">
            ₹{analysis.performance?.week52High.toLocaleString("en-IN")}
          </span>
        </div>
        <div className="perf-item">
          <span className="label">52W Low</span>
          <span className="value">
            ₹{analysis.performance?.week52Low.toLocaleString("en-IN")}
          </span>
        </div>
        <div className="perf-item">
          <span className="label">Volume</span>
          <span className="value">
            {(analysis.price.volume / 1000000).toFixed(2)}M
          </span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="tab-navigation">
        <button
          className={activeTab === "overview" ? "active" : ""}
          onClick={() => setActiveTab("overview")}
        >
          Overview
        </button>
        <button
          className={activeTab === "financials" ? "active" : ""}
          onClick={() => setActiveTab("financials")}
        >
          Financials
        </button>
        <button
          className={activeTab === "technicals" ? "active" : ""}
          onClick={() => setActiveTab("technicals")}
        >
          Technicals
        </button>
        <button
          className={activeTab === "holdings" ? "active" : ""}
          onClick={() => setActiveTab("holdings")}
        >
          Holdings
        </button>
        <button
          className={activeTab === "events" ? "active" : ""}
          onClick={() => setActiveTab("events")}
        >
          Events
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === "overview" && <OverviewTab analysis={analysis} />}
        {activeTab === "financials" && <FinancialsTab analysis={analysis} />}
        {activeTab === "technicals" && <TechnicalsTab analysis={analysis} />}
        {activeTab === "holdings" && <HoldingsTab analysis={analysis} />}
        {activeTab === "events" && <EventsTab analysis={analysis} />}
      </div>
    </div>
  );
};

// Overview Tab Component
const OverviewTab = ({ analysis }) => (
  <div className="overview-content">
    <div className="content-grid">
      {/* Signal Card */}
      <div className="section-card">
        <SignalCard analysis={analysis} />
      </div>

      {/* Order Depth */}
      <div className="section-card">
        <h2>Market Order Depth</h2>
        <div className="order-depth">
          <div className="bids">
            <h4>Bids</h4>
            <table>
              <thead>
                <tr>
                  <th>Price</th>
                  <th>Qty</th>
                  <th>Orders</th>
                </tr>
              </thead>
              <tbody>
                {analysis.orderDepth?.bids.map((bid, i) => (
                  <tr key={i}>
                    <td className="positive">₹{bid.price}</td>
                    <td>{bid.quantity.toLocaleString()}</td>
                    <td>{bid.orders}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="asks">
            <h4>Asks</h4>
            <table>
              <thead>
                <tr>
                  <th>Price</th>
                  <th>Qty</th>
                  <th>Orders</th>
                </tr>
              </thead>
              <tbody>
                {analysis.orderDepth?.asks.map((ask, i) => (
                  <tr key={i}>
                    <td className="negative">₹{ask.price}</td>
                    <td>{ask.quantity.toLocaleString()}</td>
                    <td>{ask.orders}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    {/* About Section */}
    <div className="section-card">
      <h2>About {analysis.name}</h2>
      <p className="about-description">{analysis.about?.description}</p>
      <div className="about-details">
        <div className="detail-item">
          <span className="label">Founded</span>
          <span className="value">{analysis.about?.founded}</span>
        </div>
        <div className="detail-item">
          <span className="label">Headquarters</span>
          <span className="value">{analysis.about?.headquarters}</span>
        </div>
        <div className="detail-item">
          <span className="label">CEO</span>
          <span className="value">{analysis.about?.ceo}</span>
        </div>
        <div className="detail-item">
          <span className="label">Employees</span>
          <span className="value">{analysis.about?.employees}</span>
        </div>
        <div className="detail-item">
          <span className="label">Website</span>
          <span className="value">
            <a
              href={`https://${analysis.about?.website}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {analysis.about?.website}
            </a>
          </span>
        </div>
        <div className="detail-item">
          <span className="label">Market Cap</span>
          <span className="value">{analysis.about?.marketCap}</span>
        </div>
      </div>
    </div>

    {/* Analyst Rating */}
    <div className="section-card">
      <h2>Analyst Rating</h2>
      <div className="analyst-rating">
        <div className="rating-score">
          <span className="score">{analysis.analystRating?.rating}</span>
          <span className="max-score">/5.0</span>
        </div>
        <div className="rating-breakdown">
          <div className="breakdown-item">
            <span className="label">Buy</span>
            <div className="bar-container">
              <div
                className="bar buy"
                style={{
                  width: `${(analysis.analystRating?.buy / analysis.analystRating?.totalAnalysts) * 100}%`,
                }}
              ></div>
            </div>
            <span className="count">{analysis.analystRating?.buy}</span>
          </div>
          <div className="breakdown-item">
            <span className="label">Hold</span>
            <div className="bar-container">
              <div
                className="bar hold"
                style={{
                  width: `${(analysis.analystRating?.hold / analysis.analystRating?.totalAnalysts) * 100}%`,
                }}
              ></div>
            </div>
            <span className="count">{analysis.analystRating?.hold}</span>
          </div>
          <div className="breakdown-item">
            <span className="label">Sell</span>
            <div className="bar-container">
              <div
                className="bar sell"
                style={{
                  width: `${(analysis.analystRating?.sell / analysis.analystRating?.totalAnalysts) * 100}%`,
                }}
              ></div>
            </div>
            <span className="count">{analysis.analystRating?.sell}</span>
          </div>
        </div>
        <div className="target-price">
          <span className="label">Target Price</span>
          <span className="value">
            ₹{analysis.analystRating?.targetPrice.toLocaleString("en-IN")}
          </span>
          <span className="upside positive">
            +{analysis.analystRating?.upside}% upside
          </span>
        </div>
      </div>
    </div>

    {/* Insights */}
    <div className="section-card">
      <h2>Key Insights</h2>
      <ul className="insights-list">
        {analysis.insights?.map((insight, i) => (
          <li key={i}>{insight}</li>
        ))}
      </ul>
    </div>

    {/* Peer Comparison */}
    <div className="section-card">
      <h2>Peer Comparison</h2>
      <div className="table-responsive">
        <table className="peer-table">
          <thead>
            <tr>
              <th>Company</th>
              <th>P/E Ratio</th>
              <th>Market Cap (Cr)</th>
              <th>Revenue (Cr)</th>
              <th>Profit (Cr)</th>
            </tr>
          </thead>
          <tbody>
            {analysis.peerComparison?.peers.map((peer, i) => (
              <tr key={i}>
                <td>
                  <strong>{peer.name}</strong>
                </td>
                <td>{peer.pe}</td>
                <td>₹{peer.marketCap.toLocaleString("en-IN")}</td>
                <td>₹{peer.revenue.toLocaleString("en-IN")}</td>
                <td>₹{peer.profit.toLocaleString("en-IN")}</td>
              </tr>
            ))}
            <tr className="sector-avg">
              <td>
                <strong>Sector Average</strong>
              </td>
              <td>{analysis.peerComparison?.sectorAverage.pe}</td>
              <td>
                ₹
                {analysis.peerComparison?.sectorAverage.marketCap.toLocaleString(
                  "en-IN",
                )}
              </td>
              <td>
                ₹
                {analysis.peerComparison?.sectorAverage.revenue.toLocaleString(
                  "en-IN",
                )}
              </td>
              <td>
                ₹
                {analysis.peerComparison?.sectorAverage.profit.toLocaleString(
                  "en-IN",
                )}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    {/* FAQs */}
    <div className="section-card">
      <h2>Frequently Asked Questions</h2>
      <div className="faqs">
        {analysis.faqs?.map((faq, i) => (
          <div key={i} className="faq-item">
            <h4>{faq.question}</h4>
            <p>{faq.answer}</p>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// Financials Tab Component
const FinancialsTab = ({ analysis }) => (
  <div className="financials-content">
    {/* Company Financials */}
    <div className="section-card">
      <h2>Quarterly Financials</h2>
      <div className="table-responsive">
        <table className="financials-table">
          <thead>
            <tr>
              <th>Quarter</th>
              <th>Revenue (Cr)</th>
              <th>Profit (Cr)</th>
              <th>Margin (%)</th>
            </tr>
          </thead>
          <tbody>
            {analysis.financials?.quarterly.map((q, i) => (
              <tr key={i}>
                <td>
                  <strong>{q.quarter}</strong>
                </td>
                <td>₹{q.revenue.toLocaleString("en-IN")}</td>
                <td>₹{q.profit.toLocaleString("en-IN")}</td>
                <td>{q.margin}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>

    <div className="section-card">
      <h2>Annual Financials</h2>
      <div className="table-responsive">
        <table className="financials-table">
          <thead>
            <tr>
              <th>Year</th>
              <th>Revenue (Cr)</th>
              <th>Profit (Cr)</th>
              <th>Margin (%)</th>
            </tr>
          </thead>
          <tbody>
            {analysis.financials?.annual.map((y, i) => (
              <tr key={i}>
                <td>
                  <strong>{y.year}</strong>
                </td>
                <td>₹{y.revenue.toLocaleString("en-IN")}</td>
                <td>₹{y.profit.toLocaleString("en-IN")}</td>
                <td>{y.margin}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>

    {/* Valuation */}
    <div className="section-card">
      <h2>Valuation Metrics</h2>
      <div className="metrics-grid">
        <div className="metric-item">
          <span className="label">P/E Ratio</span>
          <span className="value">{analysis.valuation?.pe}</span>
        </div>
        <div className="metric-item">
          <span className="label">P/B Ratio</span>
          <span className="value">{analysis.valuation?.pb}</span>
        </div>
        <div className="metric-item">
          <span className="label">EPS</span>
          <span className="value">₹{analysis.valuation?.eps}</span>
        </div>
        <div className="metric-item">
          <span className="label">Book Value</span>
          <span className="value">₹{analysis.valuation?.bookValue}</span>
        </div>
        <div className="metric-item">
          <span className="label">Dividend Yield</span>
          <span className="value">
            {(analysis.valuation?.dividendYield * 100).toFixed(2)}%
          </span>
        </div>
        <div className="metric-item">
          <span className="label">Industry P/E</span>
          <span className="value">{analysis.valuation?.industryPE}</span>
        </div>
      </div>
    </div>

    {/* Key Indicators */}
    <div className="section-card">
      <h2>Key Indicators</h2>
      <div className="metrics-grid">
        <div className="metric-item">
          <span className="label">ROE (Return on Equity)</span>
          <span className="value">{analysis.keyIndicators?.roe}%</span>
        </div>
        <div className="metric-item">
          <span className="label">ROA (Return on Assets)</span>
          <span className="value">{analysis.keyIndicators?.roa}%</span>
        </div>
        <div className="metric-item">
          <span className="label">ROCE</span>
          <span className="value">{analysis.keyIndicators?.roce}%</span>
        </div>
        <div className="metric-item">
          <span className="label">BVPS (Book Value Per Share)</span>
          <span className="value">₹{analysis.keyIndicators?.bvps}</span>
        </div>
        <div className="metric-item">
          <span className="label">EPS (Earnings Per Share)</span>
          <span className="value">₹{analysis.keyIndicators?.eps}</span>
        </div>
        <div className="metric-item">
          <span className="label">Debt to Equity</span>
          <span className="value">{analysis.keyIndicators?.debtToEquity}</span>
        </div>
        <div className="metric-item">
          <span className="label">Current Ratio</span>
          <span className="value">{analysis.keyIndicators?.currentRatio}</span>
        </div>
        <div className="metric-item">
          <span className="label">Quick Ratio</span>
          <span className="value">{analysis.keyIndicators?.quickRatio}</span>
        </div>
      </div>
    </div>

    {/* Earnings and Dividends */}
    <div className="section-card">
      <h2>Earnings & Dividends</h2>
      <div className="earnings-dividends-grid">
        <div>
          <h3>Recent Earnings</h3>
          <table className="earnings-table">
            <thead>
              <tr>
                <th>Quarter</th>
                <th>EPS</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {analysis.earningsAndDividends?.earnings.map((e, i) => (
                <tr key={i}>
                  <td>{e.quarter}</td>
                  <td>₹{e.eps}</td>
                  <td>{new Date(e.date).toLocaleDateString("en-IN")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div>
          <h3>Dividend History</h3>
          <table className="dividends-table">
            <thead>
              <tr>
                <th>Year</th>
                <th>Dividend</th>
                <th>Yield</th>
              </tr>
            </thead>
            <tbody>
              {analysis.earningsAndDividends?.dividends.map((d, i) => (
                <tr key={i}>
                  <td>{d.year}</td>
                  <td>₹{d.dividend}</td>
                  <td>{(d.yield * 100).toFixed(2)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>

    {/* Forecast */}
    <div className="section-card">
      <h2>Analyst Forecast</h2>
      <div className="forecast-grid">
        <div className="forecast-item">
          <h4>Next Quarter Estimate</h4>
          <p>
            Revenue: ₹
            {analysis.forecast?.nextQuarter.revenue.toLocaleString("en-IN")} Cr
          </p>
          <p>
            Profit: ₹
            {analysis.forecast?.nextQuarter.profit.toLocaleString("en-IN")} Cr
          </p>
          <p>EPS: ₹{analysis.forecast?.nextQuarter.eps}</p>
        </div>
        <div className="forecast-item">
          <h4>Next Year Estimate</h4>
          <p>
            Revenue: ₹
            {analysis.forecast?.nextYear.revenue.toLocaleString("en-IN")} Cr
          </p>
          <p>
            Profit: ₹
            {analysis.forecast?.nextYear.profit.toLocaleString("en-IN")} Cr
          </p>
          <p>EPS: ₹{analysis.forecast?.nextYear.eps}</p>
        </div>
        <div className="forecast-item">
          <h4>Growth Estimates</h4>
          <p>Revenue Growth: {analysis.forecast?.revenueGrowth}%</p>
          <p>Profit Growth: {analysis.forecast?.profitGrowth}%</p>
          <p>Overall Growth: {analysis.forecast?.growthRate}%</p>
        </div>
      </div>
    </div>
  </div>
);

// Technicals Tab Component
const TechnicalsTab = ({ analysis }) => (
  <div className="technicals-content">
    <div className="content-grid">
      <div className="section-card">
        <h2>Technical Indicators</h2>
        <MetricsTable
          technical={analysis.indicators}
          fundamental={analysis.fundamentals}
        />
      </div>

      <div className="section-card">
        <h2>Technical Analysis Summary</h2>
        <div className="technical-summary">
          <div className="summary-item">
            <span className="label">Overall Signal</span>
            <span className={`signal-badge ${analysis.signal.toLowerCase()}`}>
              {analysis.signal}
            </span>
          </div>
          <div className="summary-item">
            <span className="label">Confidence</span>
            <span className="value">{analysis.confidence}</span>
          </div>
          <div className="summary-item">
            <span className="label">Signal Score</span>
            <span className="value">{analysis.score}/100</span>
          </div>
        </div>
        <div className="reasons">
          <h4>Analysis Reasons:</h4>
          <ul>
            {analysis.reasons?.map((reason, i) => (
              <li key={i}>{reason}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  </div>
);

// Holdings Tab Component
const HoldingsTab = ({ analysis }) => (
  <div className="holdings-content">
    {/* Mutual Fund Holdings */}
    <div className="section-card">
      <h2>Mutual Fund Holdings</h2>
      <div className="table-responsive">
        <table className="holdings-table">
          <thead>
            <tr>
              <th>Fund Name</th>
              <th>Holding (%)</th>
              <th>Value (Cr)</th>
              <th>Change</th>
            </tr>
          </thead>
          <tbody>
            {analysis.mutualFundHoldings?.map((fund, i) => (
              <tr key={i}>
                <td>
                  <strong>{fund.fundName}</strong>
                </td>
                <td>{fund.holding}%</td>
                <td>₹{fund.value.toLocaleString("en-IN")}</td>
                <td className={fund.change >= 0 ? "positive" : "negative"}>
                  {fund.change >= 0 ? "+" : ""}
                  {fund.change}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>

    {/* Shareholding Pattern */}
    <div className="section-card">
      <h2>Shareholding Pattern by Year</h2>
      <div className="table-responsive">
        <table className="shareholding-table">
          <thead>
            <tr>
              <th>Year</th>
              <th>Promoter (%)</th>
              <th>FII (%)</th>
              <th>DII (%)</th>
              <th>Public (%)</th>
            </tr>
          </thead>
          <tbody>
            {analysis.shareholdingPattern?.map((year, i) => (
              <tr key={i}>
                <td>
                  <strong>{year.year}</strong>
                </td>
                <td>{year.promoter}%</td>
                <td>{year.fii}%</td>
                <td>{year.dii}%</td>
                <td>{year.public}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

// Events Tab Component
const EventsTab = ({ analysis }) => (
  <div className="events-content">
    <div className="section-card">
      <h2>Key Events</h2>
      <div className="events-timeline">
        {analysis.keyEvents?.map((event, i) => (
          <div key={i} className={`event-item ${event.impact}`}>
            <div className="event-date">
              {new Date(event.date).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </div>
            <div className="event-content">
              <h4>{event.title}</h4>
              <p>{event.description}</p>
            </div>
            <div className={`event-impact ${event.impact}`}>{event.impact}</div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default SymbolAnalysis;
