import React, { useEffect, useRef, useState } from 'react';
import { createChart } from 'lightweight-charts';
import './StockChart.css';

const StockChart = ({ symbol, chartData }) => {
  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);
  const candlestickSeriesRef = useRef(null);
  const volumeSeriesRef = useRef(null);
  const [period, setPeriod] = useState('1y');
  const [chartType, setChartType] = useState('candlestick');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Create chart
    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 500,
      layout: {
        background: { color: '#ffffff' },
        textColor: '#333',
      },
      grid: {
        vertLines: { color: '#f0f0f0' },
        horzLines: { color: '#f0f0f0' },
      },
      crosshair: {
        mode: 1,
      },
      rightPriceScale: {
        borderColor: '#d1d4dc',
      },
      timeScale: {
        borderColor: '#d1d4dc',
        timeVisible: true,
        secondsVisible: false,
      },
    });

    chartRef.current = chart;

    // Add candlestick series
    const candlestickSeries = chart.addCandlestickSeries({
      upColor: '#26a69a',
      downColor: '#ef5350',
      borderVisible: false,
      wickUpColor: '#26a69a',
      wickDownColor: '#ef5350',
    });

    candlestickSeriesRef.current = candlestickSeries;

    // Add volume series
    const volumeSeries = chart.addHistogramSeries({
      color: '#26a69a',
      priceFormat: {
        type: 'volume',
      },
      priceScaleId: '',
      scaleMargins: {
        top: 0.8,
        bottom: 0,
      },
    });

    volumeSeriesRef.current = volumeSeries;

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (chartRef.current) {
        chartRef.current.remove();
      }
    };
  }, []);

  useEffect(() => {
    if (chartData && candlestickSeriesRef.current && volumeSeriesRef.current) {
      const formattedData = chartData.map(item => ({
        time: new Date(item.date).getTime() / 1000,
        open: item.open,
        high: item.high,
        low: item.low,
        close: item.close,
      }));

      const volumeData = chartData.map(item => ({
        time: new Date(item.date).getTime() / 1000,
        value: item.volume,
        color: item.close >= item.open ? '#26a69a80' : '#ef535080',
      }));

      candlestickSeriesRef.current.setData(formattedData);
      volumeSeriesRef.current.setData(volumeData);

      // Fit content
      if (chartRef.current) {
        chartRef.current.timeScale().fitContent();
      }
    }
  }, [chartData]);

  const handlePeriodChange = async (newPeriod) => {
    setPeriod(newPeriod);
    setLoading(true);
    
    try {
      const response = await fetch(
        `http://localhost:5000/api/stocks/${symbol}/chart?period=${newPeriod}&interval=${getIntervalForPeriod(newPeriod)}`
      );
      const result = await response.json();
      
      if (result.success && candlestickSeriesRef.current && volumeSeriesRef.current) {
        const formattedData = result.data.map(item => ({
          time: new Date(item.date).getTime() / 1000,
          open: item.open,
          high: item.high,
          low: item.low,
          close: item.close,
        }));

        const volumeData = result.data.map(item => ({
          time: new Date(item.date).getTime() / 1000,
          value: item.volume,
          color: item.close >= item.open ? '#26a69a80' : '#ef535080',
        }));

        candlestickSeriesRef.current.setData(formattedData);
        volumeSeriesRef.current.setData(volumeData);

        if (chartRef.current) {
          chartRef.current.timeScale().fitContent();
        }
      }
    } catch (error) {
      console.error('Failed to fetch chart data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getIntervalForPeriod = (period) => {
    switch (period) {
      case '1d': return '5m';
      case '5d': return '15m';
      case '1m': return '1h';
      case '3m': return '1d';
      case '6m': return '1d';
      case '1y': return '1d';
      case '5y': return '1wk';
      default: return '1d';
    }
  };

  return (
    <div className="stock-chart">
      <div className="chart-controls">
        <div className="period-selector">
          {['1d', '5d', '1m', '3m', '6m', '1y', '5y'].map((p) => (
            <button
              key={p}
              className={`period-btn ${period === p ? 'active' : ''}`}
              onClick={() => handlePeriodChange(p)}
              disabled={loading}
            >
              {p.toUpperCase()}
            </button>
          ))}
        </div>
      </div>
      
      {loading && (
        <div className="chart-loading">
          <div className="spinner"></div>
          Loading chart data...
        </div>
      )}
      
      <div ref={chartContainerRef} className="chart-container" />
    </div>
  );
};

export default StockChart;
