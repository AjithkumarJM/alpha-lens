import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './StockList.css';

const StockList = () => {
  const [stocks, setStocks] = useState([]);
  const [filteredStocks, setFilteredStocks] = useState([]);
  const [sectors, setSectors] = useState([]);
  const [selectedSector, setSelectedSector] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [quotes, setQuotes] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    fetchStocks();
    fetchSectors();
  }, []);

  useEffect(() => {
    filterStocks();
  }, [stocks, selectedSector, searchQuery]);

  const fetchStocks = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/stocks');
      const result = await response.json();
      
      if (result.success) {
        setStocks(result.data);
        setFilteredStocks(result.data);
        // Fetch quotes for top 10 stocks
        fetchQuotesForStocks(result.data.slice(0, 10));
      }
    } catch (error) {
      console.error('Failed to fetch stocks:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSectors = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/stocks/sectors');
      const result = await response.json();
      
      if (result.success) {
        setSectors(['All', ...result.data]);
      }
    } catch (error) {
      console.error('Failed to fetch sectors:', error);
    }
  };

  const fetchQuotesForStocks = async (stockList) => {
    const newQuotes = {};
    
    for (const stock of stockList) {
      try {
        const response = await fetch(`http://localhost:5000/api/stocks/${stock.symbol}/quote`);
        const result = await response.json();
        
        if (result.success) {
          newQuotes[stock.symbol] = result.data;
        }
      } catch (error) {
        console.error(`Failed to fetch quote for ${stock.symbol}:`, error);
      }
    }
    
    setQuotes(newQuotes);
  };

  const filterStocks = () => {
    let filtered = stocks;

    // Filter by sector
    if (selectedSector !== 'All') {
      filtered = filtered.filter(stock => stock.sector === selectedSector);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(stock =>
        stock.name.toLowerCase().includes(query) ||
        stock.symbol.toLowerCase().includes(query) ||
        stock.industry.toLowerCase().includes(query)
      );
    }

    setFilteredStocks(filtered);
  };

  const handleStockClick = (symbol) => {
    navigate(`/analysis/${symbol}`);
  };

  const getChangeClass = (changePercent) => {
    if (changePercent > 0) return 'positive';
    if (changePercent < 0) return 'negative';
    return 'neutral';
  };

  if (loading) {
    return (
      <div className="stock-list-loading">
        <div className="loading-spinner"></div>
        <p>Loading NSE stocks...</p>
      </div>
    );
  }

  return (
    <div className="stock-list-container">
      <div className="stock-list-header">
        <h1>NSE Stock Market</h1>
        <p className="subtitle">{stocks.length}+ stocks available for analysis</p>
      </div>

      <div className="stock-list-filters">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search stocks by name, symbol, or industry..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <span className="search-icon">🔍</span>
        </div>

        <div className="sector-filter">
          <label>Sector:</label>
          <select
            value={selectedSector}
            onChange={(e) => setSelectedSector(e.target.value)}
            className="sector-select"
          >
            {sectors.map(sector => (
              <option key={sector} value={sector}>{sector}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="stock-count">
        Showing {filteredStocks.length} stock{filteredStocks.length !== 1 ? 's' : ''}
      </div>

      <div className="stock-grid">
        {filteredStocks.map((stock) => {
          const quote = quotes[stock.symbol];
          
          return (
            <div
              key={stock.symbol}
              className="stock-card"
              onClick={() => handleStockClick(stock.symbol)}
            >
              <div className="stock-card-header">
                <div>
                  <h3 className="stock-name">{stock.name}</h3>
                  <p className="stock-symbol">{stock.symbol}</p>
                </div>
                {quote && (
                  <div className={`stock-price ${getChangeClass(quote.changePercent)}`}>
                    ₹{quote.price?.toFixed(2) || '0.00'}
                  </div>
                )}
              </div>

              <div className="stock-card-body">
                <div className="stock-info">
                  <span className="info-label">Sector:</span>
                  <span className="info-value">{stock.sector}</span>
                </div>
                <div className="stock-info">
                  <span className="info-label">Industry:</span>
                  <span className="info-value">{stock.industry}</span>
                </div>
                
                {quote && (
                  <>
                    <div className="stock-info">
                      <span className="info-label">Change:</span>
                      <span className={`info-value ${getChangeClass(quote.changePercent)}`}>
                        {quote.changePercent > 0 ? '+' : ''}{quote.changePercent?.toFixed(2)}%
                      </span>
                    </div>
                    <div className="stock-info">
                      <span className="info-label">Volume:</span>
                      <span className="info-value">
                        {quote.volume ? (quote.volume / 1000000).toFixed(2) + 'M' : 'N/A'}
                      </span>
                    </div>
                  </>
                )}
              </div>

              <div className="stock-card-footer">
                <button className="analyze-btn">View Analysis</button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredStocks.length === 0 && (
        <div className="no-results">
          <p>No stocks found matching your criteria</p>
          <button onClick={() => { setSearchQuery(''); setSelectedSector('All'); }}>
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
};

export default StockList;
