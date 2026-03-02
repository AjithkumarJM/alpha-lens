import { describe, it, expect } from 'vitest'
import { calculateSMA, calculateRSI, calculateMACD } from '../utils/indicators'

describe('Technical Indicators', () => {
  const mockData = [
    { date: '2024-01-01', close: 100 },
    { date: '2024-01-02', close: 102 },
    { date: '2024-01-03', close: 101 },
    { date: '2024-01-04', close: 105 },
    { date: '2024-01-05', close: 103 },
    { date: '2024-01-06', close: 107 },
    { date: '2024-01-07', close: 110 },
    { date: '2024-01-08', close: 108 },
    { date: '2024-01-09', close: 112 },
    { date: '2024-01-10', close: 115 },
  ]

  describe('calculateSMA', () => {
    it('calculates simple moving average correctly', () => {
      const sma = calculateSMA(mockData, 3)
      
      expect(sma).toHaveLength(8)
      expect(sma[0].value).toBeCloseTo(101, 1)
      expect(sma[sma.length - 1].date).toBe('2024-01-10')
    })

    it('returns empty array when insufficient data', () => {
      const sma = calculateSMA(mockData.slice(0, 2), 5)
      expect(sma).toHaveLength(0)
    })
  })

  describe('calculateRSI', () => {
    it('calculates RSI correctly', () => {
      const extendedData = [...mockData, ...mockData, ...mockData]
      const rsi = calculateRSI(extendedData, 14)
      
      expect(rsi.length).toBeGreaterThan(0)
      expect(rsi[0].value).toBeGreaterThan(0)
      expect(rsi[0].value).toBeLessThan(100)
    })

    it('returns empty array when insufficient data', () => {
      const rsi = calculateRSI(mockData.slice(0, 5), 14)
      expect(rsi).toHaveLength(0)
    })
  })

  describe('calculateMACD', () => {
    it('calculates MACD correctly', () => {
      const extendedData = Array(50).fill(null).map((_, i) => ({
        date: `2024-01-${i + 1}`,
        close: 100 + Math.random() * 20,
      }))
      
      const macd = calculateMACD(extendedData)
      
      expect(macd).toHaveProperty('macd')
      expect(macd).toHaveProperty('signal')
      expect(macd).toHaveProperty('histogram')
      expect(macd.histogram.length).toBeGreaterThan(0)
    })

    it('returns empty arrays when insufficient data', () => {
      const macd = calculateMACD(mockData)
      
      expect(macd.macd).toHaveLength(0)
      expect(macd.signal).toHaveLength(0)
      expect(macd.histogram).toHaveLength(0)
    })
  })
})
