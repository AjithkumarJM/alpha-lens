-- Database Schema for Stock Analysis App

-- Supported symbols
CREATE TABLE symbols (
  id SERIAL PRIMARY KEY,
  symbol VARCHAR(20) UNIQUE NOT NULL,
  name VARCHAR(100),
  exchange VARCHAR(10), -- NSE, BSE
  sector VARCHAR(50),
  industry VARCHAR(100),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Daily price history
CREATE TABLE daily_quotes (
  id SERIAL PRIMARY KEY,
  symbol_id INTEGER REFERENCES symbols(id),
  date DATE NOT NULL,
  open DECIMAL(10,2),
  high DECIMAL(10,2),
  low DECIMAL(10,2),
  close DECIMAL(10,2),
  volume BIGINT,
  adj_close DECIMAL(10,2),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(symbol_id, date)
);

CREATE INDEX idx_quotes_symbol_date ON daily_quotes(symbol_id, date DESC);

-- Daily analysis runs
CREATE TABLE analysis_runs (
  id SERIAL PRIMARY KEY,
  symbol_id INTEGER REFERENCES symbols(id),
  run_date DATE NOT NULL,
  signal VARCHAR(10), -- BUY, HOLD, SELL
  confidence VARCHAR(10), -- HIGH, MEDIUM, LOW
  score INTEGER,
  reasons TEXT[], -- Array of reason strings
  indicators JSONB, -- {rsi: 42, sma50: 2420, ...}
  fundamentals JSONB,
  explanation TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(symbol_id, run_date)
);

CREATE INDEX idx_analysis_symbol_date ON analysis_runs(symbol_id, run_date DESC);

-- Users (basic auth)
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

-- User watchlists
CREATE TABLE watchlists (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  symbol_id INTEGER REFERENCES symbols(id),
  added_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, symbol_id)
);

-- User portfolios
CREATE TABLE portfolios (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  symbol_id INTEGER REFERENCES symbols(id),
  quantity INTEGER,
  avg_buy_price DECIMAL(10,2),
  buy_date DATE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Seed data: Top NSE stocks
INSERT INTO symbols (symbol, name, exchange, sector) VALUES
  ('RELIANCE.NS', 'Reliance Industries', 'NSE', 'Energy'),
  ('TCS.NS', 'Tata Consultancy Services', 'NSE', 'IT'),
  ('INFY.NS', 'Infosys', 'NSE', 'IT'),
  ('HDFCBANK.NS', 'HDFC Bank', 'NSE', 'Banking'),
  ('ICICIBANK.NS', 'ICICI Bank', 'NSE', 'Banking'),
  ('HINDUNILVR.NS', 'Hindustan Unilever', 'NSE', 'FMCG'),
  ('BHARTIARTL.NS', 'Bharti Airtel', 'NSE', 'Telecom'),
  ('SBIN.NS', 'State Bank of India', 'NSE', 'Banking'),
  ('BAJFINANCE.NS', 'Bajaj Finance', 'NSE', 'Finance'),
  ('TATAMOTORS.NS', 'Tata Motors', 'NSE', 'Automobile');
