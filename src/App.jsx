// src/App.jsx
import { useState, useEffect } from 'react';
import CryptoTable from './components/CryptoTable';
import CryptoChart from './components/CryptoChart';
import { fetchCryptocurrencies } from './services/api';

function App() {
  const [cryptos, setCryptos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCoin, setSelectedCoin] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const data = await fetchCryptocurrencies('usd', 20);
        setCryptos(data);
      } catch (err) {
        setError('Не удалось загрузить данные');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Ключевой обработчик для выбора монеты
  const handleCoinSelect = (coin) => {
    console.log('Выбрана криптовалюта:', coin.name); // Для отладки
    setSelectedCoin(coin);
    
    // Прокручиваем к графику (если он есть на странице)
    setTimeout(() => {
      const chartSection = document.getElementById('chart-section');
      if (chartSection) {
        chartSection.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  const handleBack = () => {
    setSelectedCoin(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-lg font-medium text-gray-700">Загрузка данных...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-red-500 text-lg">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Крипто-скринер
          </h1>
          <p className="text-gray-600">
            Данные обновляются в реальном времени • Валюта: USD
          </p>
        </div>
        
        {selectedCoin ? (
          <div className="space-y-6" id="chart-section">
            <button
              onClick={handleBack}
              className="flex items-center text-blue-600 hover:text-blue-800 font-medium mb-4"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Вернуться к списку
            </button>
            
            <CryptoChart 
              coinId={selectedCoin.id} 
              coinName={selectedCoin.name} 
            />
            
            {/* Информационная панель */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="border-l-4 border-blue-500 pl-4 py-2">
                  <p className="text-sm text-gray-500">Текущая цена</p>
                  <p className="text-xl font-bold">${selectedCoin.current_price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                </div>
                <div className="border-l-4 border-green-500 pl-4 py-2">
                  <p className="text-sm text-gray-500">Изменение за 24ч</p>
                  <p className={`text-xl font-bold ${selectedCoin.price_change_percentage_24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {selectedCoin.price_change_percentage_24h >= 0 ? '+' : ''}
                    {selectedCoin.price_change_percentage_24h.toFixed(2)}%
                  </p>
                </div>
                <div className="border-l-4 border-purple-500 pl-4 py-2">
                  <p className="text-sm text-gray-500">Рыночная капитализация</p>
                  <p className="text-xl font-bold">${(selectedCoin.market_cap / 1000000000).toFixed(2)}B</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            {/* КРИТИЧЕСКИ ВАЖНО: передаем onSelectCoin в CryptoTable */}
            <CryptoTable 
              cryptos={cryptos} 
              onSelectCoin={handleCoinSelect} 
            />
          </div>
        )}
        
        <div className="mt-6 text-center text-sm text-gray-500">
          Данные предоставлены CoinGecko API • Обновлено: {new Date().toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
}

export default App;