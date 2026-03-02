import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchWatchlist, removeFromWatchlist } from '../services/api';
import './Watchlist.css';

const Watchlist = () => {
  const navigate = useNavigate();
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    loadWatchlist();
  }, []);
  
  const loadWatchlist = async () => {
    try {
      setLoading(true);
      const response = await fetchWatchlist();
      setWatchlist(response.data.watchlist || []);
    } catch (err) {
      console.error('Failed to load watchlist:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleRemove = async (symbol) => {
    try {
      await removeFromWatchlist(symbol);
      setWatchlist(watchlist.filter(s => s !== symbol));
    } catch (err) {
      alert('Failed to remove from watchlist');
    }
  };
  
  if (loading) {
    return (
      <div className="watchlist">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading watchlist...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="watchlist">
      <header className="watchlist-header">
        <h1>My Watchlist</h1>
        <p>{watchlist.length} symbols tracked</p>
      </header>
      
      {watchlist.length === 0 ? (
        <div className="empty-state">
          <p>Your watchlist is empty</p>
          <button onClick={() => navigate('/')}>Browse Stocks</button>
        </div>
      ) : (
        <div className="watchlist-grid">
          {watchlist.map(symbol => (
            <div key={symbol} className="watchlist-card">
              <h3>{symbol}</h3>
              <div className="card-actions">
                <button 
                  className="btn-view"
                  onClick={() => navigate(`/analysis/${symbol}`)}
                >
                  View Analysis
                </button>
                <button 
                  className="btn-remove"
                  onClick={() => handleRemove(symbol)}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Watchlist;
