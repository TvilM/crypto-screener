// src/components/CryptoTable.jsx
import { useState, useMemo } from 'react';

const CryptoTable = ({ cryptos = [], onSelectCoin }) => {
  const [sortField, setSortField] = useState('market_cap_rank');
  const [sortDirection, setSortDirection] = useState('asc');

  // Защита на случай, если cryptos не является массивом
  const safeCryptos = Array.isArray(cryptos) ? cryptos : [];

  // Сортировка данных
  const sortedCryptos = useMemo(() => {
    if (!safeCryptos.length) return [];
    
    return [...safeCryptos].sort((a, b) => {
      // Защита от undefined значений
      const valueA = a[sortField] ?? 0;
      const valueB = b[sortField] ?? 0;
      
      if (valueA < valueB) return sortDirection === 'asc' ? -1 : 1;
      if (valueA > valueB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [safeCryptos, sortField, sortDirection]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getArrow = (field) => {
    if (field !== sortField) return '';
    return sortDirection === 'asc' ? ' ↑' : ' ↓';
  };

  if (!onSelectCoin) {
    console.warn('onSelectCoin prop is missing in CryptoTable component');
  }

  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th 
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              onClick={() => handleSort('market_cap_rank')}
            >
              # {getArrow('market_cap_rank')}
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Монета</th>
            <th 
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              onClick={() => handleSort('current_price')}
            >
              Цена {getArrow('current_price')}
            </th>
            <th 
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              onClick={() => handleSort('price_change_percentage_24h')}
            >
              24ч % {getArrow('price_change_percentage_24h')}
            </th>
            <th 
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              onClick={() => handleSort('market_cap')}
            >
              Рыночная капитализация {getArrow('market_cap')}
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              График
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {sortedCryptos.length === 0 ? (
            <tr>
              <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                {safeCryptos.length === 0 ? 'Загрузка данных...' : 'Нет данных для отображения'}
              </td>
            </tr>
          ) : (
            sortedCryptos.map((crypto) => (
              <tr 
                key={crypto.id || crypto.symbol} 
                className="hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => onSelectCoin && onSelectCoin(crypto)}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="font-medium">{crypto.market_cap_rank}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {crypto.image && (
                      <img 
                        src={crypto.image} 
                        alt={crypto.name} 
                        className="w-8 h-8 rounded-full mr-3"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "https://via.placeholder.com/32?text=No+Image";
                        }}
                      />
                    )}
                    <div>
                      <div className="font-medium text-gray-900">{crypto.name}</div>
                      <div className="text-sm text-gray-500">{crypto.symbol?.toUpperCase()}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="font-mono">
                    ${typeof crypto.current_price === 'number' 
                      ? crypto.current_price.toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 6
                        }) 
                      : 'N/A'}
                  </span>
                </td>
                <td className={`px-6 py-4 whitespace-nowrap font-medium ${
                  typeof crypto.price_change_percentage_24h === 'number' && crypto.price_change_percentage_24h >= 0 
                    ? 'text-green-600' 
                    : 'text-red-600'
                }`}>
                  {typeof crypto.price_change_percentage_24h === 'number' ? (
                    <>
                      {crypto.price_change_percentage_24h >= 0 ? '+' : ''}
                      {crypto.price_change_percentage_24h.toFixed(2)}%
                    </>
                  ) : 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="font-mono">
                    ${typeof crypto.market_cap === 'number'
                      ? (crypto.market_cap / 1000000).toFixed(1) + 'M'
                      : 'N/A'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectCoin && onSelectCoin(crypto);
                    }}
                    className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-md text-sm transition flex items-center justify-center"
                  >
                    <span>Показать график</span>
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default CryptoTable;