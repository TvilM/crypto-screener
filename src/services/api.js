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

// src/services/api.js
export const fetchCryptoOHLC = async (coinId, currency = 'usd', days = 7) => {
  try {
    console.log('Запрос OHLC данных для:', coinId, 'на', days, 'дней');
    const url = `https://api.coingecko.com/api/v3/coins/${coinId}/ohlc?vs_currency=${currency}&days=${days}`;
    console.log('URL запроса:', url);
    
    const response = await fetch(url);
    console.log('Статус ответа:', response.status);
    
    if (!response.ok) {
      const errorData = await response.text();
      console.error('Ошибка API:', errorData);
      throw new Error(`API error: ${response.status} - ${errorData}`);
    }
    
    const data = await response.json();
    console.log('Получены OHLC данные:', data.slice(0, 3)); // Показываем первые 3 записи
    
    return data.map(([timestamp, open, high, low, close]) => ({
      x: new Date(timestamp),
      o: open,
      h: high,
      l: low,
      c: close
    }));
  } catch (error) {
    console.error('КРИТИЧЕСКАЯ ОШИБКА OHLC API:', error);
    throw error;
  }
};