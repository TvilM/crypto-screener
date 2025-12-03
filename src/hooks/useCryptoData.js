// src/hooks/useCryptoData.js
import { useState, useEffect } from 'react';
import { fetchCryptocurrencies } from '../services/api';

export const useCryptoData = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const cryptoData = await fetchCryptocurrencies('usd', 20);
        setData(cryptoData);
      } catch (err) {
        setError('Не удалось загрузить данные');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return { data, loading, error };
};