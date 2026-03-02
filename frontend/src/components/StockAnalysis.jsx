import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import StockChart from './StockChart';
import './StockAnalysis.css';

const StockAnalysis = () => {
  const { symbol } = useParams();
  const navigate = useNavigate();
  const [analysis, setAnalysis] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (symbol) {
      fetchAnalysis();
      fetchChartData();
    }
  }, [symbol]);

  const fetchAnalysis = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`http://localhost:5000/api/analysis/${symbol}`);
      const result = await response.json();

      if (result.success) {
        setAnalysis(result.data);
      } else {
        setError(result.message || 'Failed to fetch analysis');
      }
    } catch (err) {
      setError('Failed to fetch stock analysis. Please try again.');
      console.error('Analysis fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchChartData = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/stocks/${symbol}/chart?period=1y&interval=1d`);
      const result = await response.json();

      if (result.success) {
        setChartData(result.data);
      }
    } catch (err) {
      console.error('Chart data fetch error:', err);
    }
  };

  if (loading) {
    return (
      <div className="analysis-loading">
        <div className="loading-spinner"></div>
        <p>Analyzing {symbol}...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="analysis-error">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={() => navigate('/')}>Back to Stock List</button>
      </div>
    );
  }

  if (!analysis) {
    return null;
  }

  const getSignalClass = (signal) => {
    return signal?.toLowerCase() || 'hold';
  };

  return (
    <div className="stock-analysis">
      <button className="back-button" onClick={() => navigate('/')}>
        ← Back to Stocks
      </button>

      {/* Stock Header */}
      <div className="stock-header">
        <div className="stock-title">
          <h1>{analysis.name}</h1>
          <span className="stock-symbol-badge">{analysis.symbol}</span>
        </div>
        
        <div className="stock-price-info">
          <div className="current-price">
            ₹{analysis.price?.current?.toFixed(2) || '0.00'}
          </div>
          <div className={`price-change ${analysis.price?.change >= 0 ? 'positive' : 'negative'}`}>
            {analysis.price?.change >= 0 ? '+' : ''}{analysis.price?.change?.toFixed(2)} 
            ({analysis.price?.changePercent}%)
          </div>
        </div>

        <div className={`signal-badge ${getSignalClass(analysis.signal)}`}>
          {analysis.signal || 'HOLD'}
          <span className="confidence">{analysis.confidence}</span>
        </div>
      </div>

      {/* Interactive Chart */}
      {chartData && <StockChart symbol={symbol} chartData={chartData} />}

      {/* Score Card */}
      <div className="score-card">
        <div className="score-circle">
          <svg width="120" height="120">
            <circle cx="60" cy="60" r="50" fill="none" stroke="#e0e0e0" strokeWidth="10" />
            <circle 
              cx="60" 
              cy="60" 
              r="50" 
              fill="none" 
              stroke={analysis.score >= 70 ? '#4caf50' : analysis.score >= 40 ? '#ff9800' : '#f44336'}
              strokeWidth="10"
              strokeDasharray={`${(analysis.score / 100) * 314} 314`}
              strokeLinecap="round"
              transform="rotate(-90 60 60)"
            />
          </svg>
          <div className="score-text">{analysis.score}/100</div>
        </div>
        <div className="score-details">
          <h3>Investment Score</h3>
          <p className="score-description">
            Based on technical and fundamental analysis
          </p>
          <div className="reasons-list">
            {analysis.reasons?.slice(0, 3).map((reason, index) => (
              <div key={index} className="reason-item">
                <span className="reason-icon">✓</span>
                {reason}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="analysis-tabs">
        <button 
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button 
          className={`tab ${activeTab === 'technicals' ? 'active' : ''}`}
          onClick={() => setActiveTab('technicals')}
        >
          Technical Analysis
        </button>
        <button 
          className={`tab ${activeTab === 'fundamentals' ? 'active' : ''}`}
          onClick={() => setActiveTab('fundamentals')}
        >
          Fundamentals
        </button>
        <button 
          className={`tab ${activeTab === 'financials' ? 'active' : ''}`}
          onClick={() => setActiveTab('financials')}
        >
          Financials
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'overview' && (
          <div className="overview-content">
            {/* About Section */}
            {analysis.about && (
              <div className="section">
                <h2>About {analysis.name}</h2>
                <p className="about-description">{analysis.about.description}</p>
                <div className="about-grid">
                  <div className="about-item">
                    <span className="label">Founded</span>
                    <span className="value">{analysis.about.founded}</span>
                  </div>
                  <div className="about-item">
                    <span className="label">Headquarters</span>
                    <span className="value">{analysis.about.headquarters}</span>
                  </div>
                  <div className="about-item">
                    <span className="label">CEO</span>
                    <span className="value">{analysis.about.ceo}</span>
                  </div>
                  <div className="about-item">
                    <span className="label">Employees</span>
                    <span className="value">{analysis.about.employees}</span>
                  </div>
                  <div className="about-item">
                    <span className="label">Sector</span>
                    <span className="value">{analysis.about.sector}</span>
                  </div>
                  <div className="about-item">
                    <span className="label">Industry</span>
                    <span className="value">{analysis.about.industry}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Performance Metrics */}
            {analysis.performance && (
              <div className="section">
                <h2>Performance Metrics</h2>
                <div className="metrics-grid">
                  <div className="metric-card">
                    <span className="metric-label">Day Range</span>
                    <span className="metric-value">
                      ₹{analysis.performance.dayLow?.toFixed(2)} - ₹{analysis.performance.dayHigh?.toFixed(2)}
                    </span>
                  </div>
                  <div className="metric-card">
                    <span className="metric-label">52 Week Range</span>
                    <span className="metric-value">
                      ₹{analysis.performance.week52Low?.toFixed(2)} - ₹{analysis.performance.week52High?.toFixed(2)}
                    </span>
                  </div>
                  <div className="metric-card">
                    <span className="metric-label">Volume</span>
                    <span className="metric-value">
                      {(analysis.price?.volume / 1000000)?.toFixed(2)}M
                    </span>
                  </div>
                  <div className="metric-card">
                    <span className="metric-label">Avg Volume</span>
                    <span className="metric-value">
                      {(analysis.performance.avgVolume / 1000000)?.toFixed(2)}M
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Key Insights */}
            {analysis.insights && analysis.insights.length > 0 && (
              <div className="section">
                <h2>Key Insights</h2>
                <div className="insights-list">
                  {analysis.insights.map((insight, index) => (
                    <div key={index} className="insight-item">
                      <span className="insight-icon">💡</span>
                      {insight}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'technicals' && (
          <div className="technicals-content">
            <div className="section">
              <h2>Technical Indicators</h2>
              {analysis.indicators && (
                <div className="indicators-grid">
                  {Object.entries(analysis.indicators).map(([key, value]) => (
                    <div key={key} className="indicator-card">
                      <span className="indicator-label">{key.toUpperCase()}</span>
                      <span className="indicator-value">
                        {typeof value === 'number' ? value.toFixed(2) : value}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'fundamentals' && (
          <div className="fundamentals-content">
            <div className="section">
              <h2>Fundamental Metrics</h2>
              {analysis.valuation && (
                <div className="fundamentals-grid">
                  <div className="fundamental-card">
                    <span className="fundamental-label">P/E Ratio</span>
                    <span className="fundamental-value">
                      {analysis.valuation.pe?.toFixed(2) || 'N/A'}
                    </span>
                  </div>
                  <div className="fundamental-card">
                    <span className="fundamental-label">P/B Ratio</span>
                    <span className="fundamental-value">
                      {analysis.valuation.pb?.toFixed(2) || 'N/A'}
                    </span>
                  </div>
                  <div className="fundamental-card">
                    <span className="fundamental-label">EPS</span>
                    <span className="fundamental-value">
                      ₹{analysis.valuation.eps?.toFixed(2) || '0.00'}
                    </span>
                  </div>
                  <div className="fundamental-card">
                    <span className="fundamental-label">Dividend Yield</span>
                    <span className="fundamental-value">
                      {(analysis.valuation.dividendYield * 100)?.toFixed(2)}%
                    </span>
                  </div>
                </div>
              )}

              {analysis.keyIndicators && (
                <>
                  <h3 style={{ marginTop: '30px' }}>Key Indicators</h3>
                  <div className="fundamentals-grid">
                    <div className="fundamental-card">
                      <span className="fundamental-label">ROE</span>
                      <span className="fundamental-value">{analysis.keyIndicators.roe}%</span>
                    </div>
                    <div className="fundamental-card">
                      <span className="fundamental-label">ROA</span>
                      <span className="fundamental-value">{analysis.keyIndicators.roa}%</span>
                    </div>
                    <div className="fundamental-card">
                      <span className="fundamental-label">Debt to Equity</span>
                      <span className="fundamental-value">{analysis.keyIndicators.debtToEquity?.toFixed(2)}</span>
                    </div>
                    <div className="fundamental-card">
                      <span className="fundamental-label">Current Ratio</span>
                      <span className="fundamental-value">{analysis.keyIndicators.currentRatio?.toFixed(2)}</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {activeTab === 'financials' && (
          <div className="financials-content">
            <div className="section">
              <h2>Financial Overview</h2>
              <p>Detailed financial statements and analysis coming soon...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StockAnalysis;