import React from 'react';
import './MetricsTable.css';

const MetricsTable = ({ technical, fundamental }) => {
  return (
    <div className="metrics-table">
      <div className="metrics-section">
        <h3>Technical Indicators</h3>
        <table>
          <tbody>
            <tr>
              <td>RSI (14)</td>
              <td>{technical.rsi_14 ? technical.rsi_14.toFixed(2) : 'N/A'}</td>
            </tr>
            <tr>
              <td>50-Day MA</td>
              <td>₹{technical.sma_50 ? technical.sma_50.toFixed(2) : 'N/A'}</td>
            </tr>
            <tr>
              <td>200-Day MA</td>
              <td>₹{technical.sma_200 ? technical.sma_200.toFixed(2) : 'N/A'}</td>
            </tr>
            {technical.macd && (
              <>
                <tr>
                  <td>MACD</td>
                  <td>{technical.macd.macd.toFixed(2)}</td>
                </tr>
                <tr>
                  <td>MACD Signal</td>
                  <td>{technical.macd.signal.toFixed(2)}</td>
                </tr>
              </>
            )}
            {technical.bollinger && (
              <>
                <tr>
                  <td>Bollinger Upper</td>
                  <td>₹{technical.bollinger.upper.toFixed(2)}</td>
                </tr>
                <tr>
                  <td>Bollinger Lower</td>
                  <td>₹{technical.bollinger.lower.toFixed(2)}</td>
                </tr>
              </>
            )}
          </tbody>
        </table>
      </div>
      
      {fundamental && (
        <div className="metrics-section">
          <h3>Fundamentals</h3>
          <table>
            <tbody>
              {fundamental.pe_ratio && (
                <tr>
                  <td>P/E Ratio</td>
                  <td>{fundamental.pe_ratio.toFixed(2)}</td>
                </tr>
              )}
              {fundamental.roe && (
                <tr>
                  <td>ROE</td>
                  <td>{fundamental.roe.toFixed(2)}%</td>
                </tr>
              )}
              {fundamental.debt_to_equity && (
                <tr>
                  <td>Debt/Equity</td>
                  <td>{fundamental.debt_to_equity.toFixed(2)}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MetricsTable;
