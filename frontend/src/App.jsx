import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import SymbolAnalysis from "./pages/SymbolAnalysis";
import Watchlist from "./pages/Watchlist";
import AllStocks from "./pages/AllStocks";
import "./App.css";

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/stocks" element={<AllStocks />} />
            <Route path="/analysis/:symbol" element={<SymbolAnalysis />} />
            <Route path="/watchlist" element={<Watchlist />} />
          </Routes>
        </main>
        <footer className="disclaimer">
          <p>
            ⚠️ <strong>Disclaimer:</strong> This application provides
            educational information only and is not financial advice. Stock
            market investments are subject to market risks. Please consult a
            registered financial advisor before making investment decisions.
          </p>
        </footer>
      </div>
    </Router>
  );
}

export default App;
