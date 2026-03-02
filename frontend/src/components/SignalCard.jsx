import React from 'react';
import './SignalCard.css';

const SignalCard = ({ analysis }) => {
  const signalColors = {
    BUY: '#10b981',
    HOLD: '#f59e0b',
    SELL: '#ef4444'
  };
  
  const confidenceBadge = {
    HIGH: '🔥',
    MEDIUM: '⚡',
    LOW: '💭'
  };
  
  return (
    <div className="signal-card">
      <div className="signal-header">
        <div 
          className="signal-badge" 
          style={{ backgroundColor: signalColors[analysis.signal] }}
        >
          {analysis.signal} {confidenceBadge[analysis.confidence]}
        </div>
        <div className="confidence">
          Confidence: {analysis.confidence} ({analysis.score}/100)
        </div>
      </div>
      
      <div className="reasons-section">
        <h3>Why this recommendation?</h3>
        <ul>
          {analysis.reasons.map((reason, i) => (
            <li key={i}>{reason}</li>
          ))}
        </ul>
      </div>
      
      <div className="explanation">
        <p><strong>Summary:</strong> {analysis.explanation}</p>
      </div>
      
      <div className="metadata">
        <span>Last updated: {new Date(analysis.timestamp).toLocaleString('en-IN')}</span>
      </div>
    </div>
  );
};

export default SignalCard;
