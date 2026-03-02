import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "./AllStocks.css";

const AllStocks = () => {
  const navigate = useNavigate();
  const [stocks, setStocks] = useState([]);
  const [filteredStocks, setFilteredStocks] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSector, setSelectedSector] = useState("All");
  const [sectors, setSectors] = useState(["All"]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStocks();
    loadSectors();
  }, []);

  useEffect(() => {
    filterStocks();
  }, [searchQuery, selectedSector, stocks]);

  const loadStocks = async () => {
    try {
      setLoading(true);
      const response = await api.get("/symbols");
      setStocks(response.data.stocks);
      setFilteredStocks(response.data.stocks);
    } catch (error) {
      console.error("Failed to load stocks:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadSectors = async () => {
    try {
      const response = await api.get("/symbols/sectors");
      setSectors(["All", ...response.data.sectors]);
    } catch (error) {
      console.error("Failed to load sectors:", error);
    }
  };

  const filterStocks = () => {
    let filtered = stocks;

    // Filter by sector
    if (selectedSector !== "All") {
      filtered = filtered.filter((stock) => stock.sector === selectedSector);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (stock) =>
          stock.name.toLowerCase().includes(query) ||
          stock.symbol.toLowerCase().includes(query) ||
          stock.industry.toLowerCase().includes(query),
      );
    }

    setFilteredStocks(filtered);
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  if (loading) {
    return (
      <div className="all-stocks">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading stocks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="all-stocks">
      <div className="stocks-header">
        <h1>All Stocks</h1>
        <p className="stock-count">{filteredStocks.length} stocks available</p>
      </div>

      <div className="search-filter-section">
        <div className="search-box">
          <svg
            className="search-icon"
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
          >
            <path
              d="M9 17A8 8 0 1 0 9 1a8 8 0 0 0 0 16zM19 19l-4.35-4.35"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          <input
            type="text"
            placeholder="Search by stock name, symbol, or industry..."
            value={searchQuery}
            onChange={handleSearch}
            className="search-input"
          />
          {searchQuery && (
            <button className="clear-btn" onClick={() => setSearchQuery("")}>
              ✕
            </button>
          )}
        </div>

        <div className="sector-filter">
          {sectors.map((sector) => (
            <button
              key={sector}
              className={`sector-btn ${selectedSector === sector ? "active" : ""}`}
              onClick={() => setSelectedSector(sector)}
            >
              {sector}
            </button>
          ))}
        </div>
      </div>

      <div className="stocks-grid">
        {filteredStocks.map((stock) => (
          <div
            key={stock.symbol}
            className="stock-item"
            onClick={() => navigate(`/analysis/${stock.symbol}`)}
          >
            <div className="stock-item-header">
              <div className="stock-symbol-circle">
                {stock.symbol.substring(0, 2)}
              </div>
              <div className="stock-basic-info">
                <h3>{stock.name}</h3>
                <p className="stock-symbol">{stock.symbol}</p>
              </div>
            </div>
            <div className="stock-item-details">
              <div className="detail-row">
                <span className="detail-label">Sector</span>
                <span className="detail-value sector-badge">
                  {stock.sector}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Industry</span>
                <span className="detail-value">{stock.industry}</span>
              </div>
            </div>
            <button className="view-analysis-btn">View Analysis →</button>
          </div>
        ))}
      </div>

      {filteredStocks.length === 0 && (
        <div className="no-results">
          <p>No stocks found matching your criteria</p>
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedSector("All");
            }}
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
};

export default AllStocks;
