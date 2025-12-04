// src/components/CryptoChart.jsx
import { useState, useEffect } from 'react';
import { fetchCryptoOHLC } from '../services/api';

const CryptoChart = ({ coinId, coinName }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rawData, setRawData] = useState(null);

  useEffect(() => {
    const loadChartData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('Начало загрузки данных для графика');
        const data = await fetchCryptoOHLC(coinId, 'usd', 7);
        
        console.log('Данные успешно получены, количество записей:', data.length);
        setRawData(data);
        
        // Имитируем задержку для визуального эффекта
        setTimeout(() => {
          setLoading(false);
        }, 1000);
        
      } catch (err) {
        console.error('Ошибка загрузки графика:', err);
        setError('Ошибка загрузки данных для графика: ' + err.message);
        setLoading(false);
      }
    };

    if (coinId) {
      loadChartData();
    }
  }, [coinId]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="h-[400px] flex flex-col items-center justify-center">
          <div className="text-blue-500 text-4xl animate-spin">🔄</div>
          <div className="text-gray-600 mt-4 text-lg">Загрузка свечного графика...</div>
          <div className="text-gray-400 mt-2 text-sm">Пожалуйста, подождите, это может занять несколько секунд</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="h-[400px] flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
          <div className="text-center text-gray-500 max-w-md p-4">
            <p className="text-lg font-medium mb-2">{error || 'Нет данных для отображения графика'}</p>
            <p className="mb-4">Попробуйте выбрать другой период или проверьте подключение к интернету.</p>
            <button 
              onClick={() => setTimeRange(7)}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
            >
              Обновить данные
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Отладочная информация
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">{coinName} - Отладочная информация</h2>
      
      <div className="space-y-4">
        <div className="p-4 bg-green-50 rounded-lg">
          <h3 className="font-bold text-green-800 mb-2">✅ Данные успешно загружены!</h3>
          <p className="text-gray-700">Количество записей: {rawData?.length || 0}</p>
          <p className="text-gray-700">Период: 7 дней</p>
          <p className="text-gray-700">Последнее обновление: {new Date().toLocaleTimeString()}</p>
        </div>
        
        <div className="p-4 bg-blue-50 rounded-lg">
          <h3 className="font-bold text-blue-800 mb-2">📊 Пример данных (первые 3 записи):</h3>
          <pre className="text-xs text-blue-900 bg-blue-100 p-3 rounded overflow-x-auto">
            {JSON.stringify(rawData?.slice(0, 3), null, 2)}
          </pre>
        </div>
        
        <div className="p-4 bg-yellow-50 rounded-lg">
          <h3 className="font-bold text-yellow-800 mb-2">🛠️ Что делать дальше?:</h3>

          <ol className="list-decimal pl-5 space-y-2 text-gray-700">
            <li>Проверьте консоль браузера (F12) на наличие ошибок</li>
            <li>Убедитесь, что запросы к API CoinGecko проходят успешно</li>
            <li>Попробуйте уменьшить период (1 день вместо 7)</li>
            <li>Обновите страницу и попробуйте выбрать другую криптовалюту</li>
          </ol>
        </div>
        
        <div className="text-center pt-4">
          <button 
            onClick={() => setLoading(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
          >
            Попробовать загрузить график еще раз
          </button>
        </div>
      </div>
    </div>
  );
};

export default CryptoChart;
