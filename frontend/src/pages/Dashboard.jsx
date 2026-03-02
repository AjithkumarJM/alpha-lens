import React from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

const Dashboard = () => {
  const navigate = useNavigate();

  const popularStocks = [
    { symbol: "RELIANCE.NS", name: "Reliance Industries", sector: "Energy" },
    { symbol: "TCS.NS", name: "Tata Consultancy Services", sector: "IT" },
    { symbol: "INFY.NS", name: "Infosys", sector: "IT" },
    { symbol: "HDFCBANK.NS", name: "HDFC Bank", sector: "Banking" },
    { symbol: "ICICIBANK.NS", name: "ICICI Bank", sector: "Banking" },
    { symbol: "HINDUNILVR.NS", name: "Hindustan Unilever", sector: "FMCG" },
    { symbol: "BHARTIARTL.NS", name: "Bharti Airtel", sector: "Telecom" },
    { symbol: "SBIN.NS", name: "State Bank of India", sector: "Banking" },
    { symbol: "BAJFINANCE.NS", name: "Bajaj Finance", sector: "Finance" },
    { symbol: "TATAMOTORS.NS", name: "Tata Motors", sector: "Automobile" },
  ];

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Stock Market Analysis Dashboard</h1>
        <p>
          Get daily Buy/Hold/Sell recommendations based on technical and
          fundamental analysis
        </p>
      </header>

      <section className="popular-stocks">
        <h2>Popular NSE Stocks</h2>
        <div className="stock-grid">
          {popularStocks.map((stock) => (
            <div
              key={stock.symbol}
              className="stock-card"
              onClick={() => navigate(`/analysis/${stock.symbol}`)}
            >
              <div className="stock-icon">{stock.symbol.substring(0, 2)}</div>
              <h3>{stock.name}</h3>
              <p className="symbol">{stock.symbol}</p>
              <span className="sector-tag">{stock.sector}</span>
              <button className="btn-analyze">View Analysis →</button>
            </div>
          ))}
        </div>
      </section>

      <section className="how-it-works">
        <h2>How It Works</h2>
        <div className="features">
          <div className="feature">
            <span className="icon">📊</span>
            <h3>Technical Analysis</h3>
            <p>RSI, MACD, Moving Averages, Volume analysis</p>
          </div>
          <div className="feature">
            <span className="icon">💰</span>
            <h3>Fundamental Metrics</h3>
            <p>P/E ratio, ROE, Debt/Equity, Earnings growth</p>
          </div>
          <div className="feature">
            <span className="icon">🎯</span>
            <h3>Clear Signals</h3>
            <p>Buy/Hold/Sell with confidence levels and reasoning</p>
          </div>
          <div className="feature">
            <span className="icon">⏰</span>
            <h3>Daily Updates</h3>
            <p>Analysis refreshed daily after market close</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
