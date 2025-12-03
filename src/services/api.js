// src/services/api.js
const API_BASE = 'https://api.coingecko.com/api/v3';

// Получение списка криптовалют
export const fetchCryptocurrencies = async (currency = 'usd', limit = 50) => {
  try {
    const response = await fetch(
      `${API_BASE}/coins/markets?vs_currency=${currency}&order=market_cap_desc&per_page=${limit}&page=1&sparkline=false`
    );
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// Получение исторических данных для графика
export const fetchCryptoHistory = async (coinId, currency = 'usd', days = 7) => {
  try {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=${currency}&days=${days}&interval=daily`
    );
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('History API Error:', error);
    throw error;
  }
};

// Получение OHLC данных для свечного графика
export const fetchCryptoOHLC = async (coinId, currency = 'usd', days = 7) => {
  try {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/coins/${coinId}/ohlc?vs_currency=${currency}&days=${days}`
    );
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Форматирование данных для свечного графика
    return data.map(([timestamp, open, high, low, close]) => ({
      x: new Date(timestamp),
      o: open,
      h: high,
      l: low,
      c: close
    }));
  } catch (error) {
    console.error('OHLC API Error:', error);
    throw error;
  }
};