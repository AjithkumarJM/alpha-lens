import React from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import "./Navbar.css";

const Navbar = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <span className="brand-icon">📈</span>
          StockAnalyzer
        </Link>
        <ul className="navbar-menu">
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/stocks">Explore Stocks</Link>
          </li>
          <li>
            <Link to="/watchlist">Watchlist</Link>
          </li>
        </ul>
        <button
          className="theme-toggle"
          onClick={toggleTheme}
          aria-label="Toggle theme"
        >
          {theme === "light" ? "🌙" : "☀️"}
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
