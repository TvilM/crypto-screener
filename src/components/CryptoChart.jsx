// src/components/CryptoChart.jsx
import { useState, useEffect, useRef } from 'react';
import { LineChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { fetchCryptoOHLC } from '../services/api';

// Кастомный компонент для отрисовки свечи
const CustomCandle = ({ x, y, width, height, payload }) => {
  if (!payload || typeof payload.o !== 'number' || typeof payload.c !== 'number') {
    return null;
  }
  
  const isBullish = payload.c >= payload.o; // Зеленая свеча (цена выросла)
  const bodyHeight = Math.abs(payload.o - payload.c);
  const bodyY = Math.min(payload.o, payload.c);
  const wickTop = Math.min(payload.h, Math.max(payload.o, payload.c));
  const wickBottom = Math.max(payload.l, Math.min(payload.o, payload.c));

  return (
    <g>
      {/* Верхняя тень (wick) */}
      <line 
        x1={x + width/2} 
        y1={y - (payload.h - payload.min) * height / payload.range} 
        x2={x + width/2} 
        y2={y - (wickTop - payload.min) * height / payload.range} 
        stroke="#6b7280" 
        strokeWidth={1} 
      />
      
      {/* Тело свечи */}
      <rect
        x={x + width/4}
        y={y - (bodyY - payload.min) * height / payload.range - bodyHeight * height / payload.range}
        width={width/2}
        height={Math.max(bodyHeight * height / payload.range, 1)}
        fill={isBullish ? '#10b981' : '#ef4444'}
        stroke={isBullish ? '#059669' : '#dc2626'}
        strokeWidth={0.5}
      />
      
      {/* Нижняя тень (wick) */}
      <line 
        x1={x + width/2} 
        y1={y - (wickBottom - payload.min) * height / payload.range} 
        x2={x + width/2} 
        y2={y - (payload.l - payload.min) * height / payload.range} 
        stroke="#6b7280" 
        strokeWidth={1} 
      />
    </g>
  );
};

const CryptoChart = ({ coinId, coinName, days = 7 }) => {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState(days);
  const chartContainerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 400 });

  // Отслеживаем размеры контейнера
  useEffect(() => {
    const updateDimensions = () => {
      if (chartContainerRef.current) {
        const width = chartContainerRef.current.clientWidth;
        setDimensions({ width, height: 400 });
      }
    };

    // Инициализация размеров
    updateDimensions();

    // Слушатель изменения размеров окна
    window.addEventListener('resize', updateDimensions);
    
    return () => {
      window.removeEventListener('resize', updateDimensions);
    };
  }, []);

  useEffect(() => {
    const loadChartData = async () => {
      try {
        setLoading(true);
        const data = await fetchCryptoOHLC(coinId, 'usd', timeRange);
        
        if (!data || !Array.isArray(data) || data.length === 0) {
          throw new Error('Нет данных для отображения');
        }
        
        // Находим максимальные и минимальные значения для правильного масштабирования
        const allPrices = data.flatMap(item => [item.o, item.h, item.l, item.c]);
        const maxValue = Math.max(...allPrices);
        const minValue = Math.min(...allPrices);
        const range = maxValue - minValue;
        const padding = range * 0.1;
        
        // Форматируем данные для графика
        const formattedData = data.map(item => ({
          date: item.x.toLocaleDateString('ru', {
            day: 'numeric',
            month: 'short'
          }),
          timestamp: item.x.getTime(),
          o: item.o,
          h: item.h,
          l: item.l,
          c: item.c,
          min: minValue - padding,
          max: maxValue + padding,
          range: range + padding * 2
        }));
        
        setChartData(formattedData);
        setError(null);
      } catch (err) {
        setError('Не удалось загрузить данные для графика');
        console.error('Chart error:', err);
      } finally {
        setLoading(false);
      }
    };

    if (coinId && dimensions.width > 0) {
      loadChartData();
    }
  }, [coinId, timeRange, dimensions.width]);

  // Форматирование даты для tooltip
  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('ru', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="h-[400px] flex items-center justify-center">
          <div className="text-gray-500 text-lg">Загрузка свечного графика...</div>
        </div>
      </div>
    );
  }

  if (error || chartData.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="h-[400px] flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
          <div className="text-center text-gray-500 max-w-md p-4">
            <p className="text-lg font-medium mb-2">{error || 'Нет данных для отображения графика'}</p>
            <p className="mb-4">Попробуйте выбрать другой период или проверьте подключение к интернету.</p>
            <p className="mb-4">Попробуйте выбрать другой период или проверьте подключение к интернету.</p>
            <p className="mb-4">Попробуйте выбрать другой период или проверьте подключение к интернету.</p>
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

  // Вычисляем текущую и начальную цены для метрик
  const lastCandle = chartData[chartData.length - 1];
  const firstCandle = chartData[0];
  const currentPrice = lastCandle.c;
  const initialPrice = firstCandle.o;
  const priceChangePercent = ((currentPrice / initialPrice) - 1) * 100;
  const isPositive = priceChangePercent >= 0;

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">{coinName} свечной график</h2>
          <p className="text-gray-500 text-sm">Данные за последние {timeRange} дней • OHLC (Open/High/Low/Close)</p>
        </div>
        <div className="flex space-x-2 mt-4 sm:mt-0">
          {[1, 7, 30, 90].map(day => (
            <button
              key={day}
              onClick={() => setTimeRange(day)}
              className={`px-3 py-1 rounded-md text-sm font-medium transition ${
                timeRange === day
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {day}д
            </button>
          ))}
        </div>
      </div>
      
      {/* Универсальный контейнер для графика */}
      <div 
        ref={chartContainerRef}
        style={{ 
          width: '100%',
          minHeight: '400px',
          minWidth: '300px',
          position: 'relative'
        }}
        className="w-full h-[400px]"
      >
        {dimensions.width > 0 && (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              width={dimensions.width}
              height={dimensions.height}
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12, fill: '#6b7280' }} 
                tickLine={false} 
                axisLine={{ stroke: '#d1d5db' }}
                minTickGap={20}
                interval="preserveStartEnd"
              />
              <YAxis 
                domain={['dataMin', 'dataMax']}
                tick={{ fontSize: 12, fill: '#6b7280' }} 
                tickLine={false} 
                axisLine={{ stroke: '#d1d5db' }}
                tickFormatter={(value) => `$${value.toLocaleString(undefined, { 
                  minimumFractionDigits: value < 1 ? 2 : 0,
                  maximumFractionDigits: value < 1 ? 4 : 2
                })}`}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                  fontSize: '14px'
                }}
                labelStyle={{ fontWeight: 'bold' }}
                formatter={(value, name, props) => {
                  const { payload } = props;
                  if (name === 'Цена') {
                    return [`$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}`, 'Цена'];
                  }
                  return [value, name];
                }}
                labelFormatter={(label, payload) => {
                  if (payload && payload[0] && payload[0].payload) {
                    return `Дата: ${formatDate(payload[0].payload.timestamp)}`;
                  }
                  return `Дата: ${label}`;
                }}
                cursor={{ stroke: '#9ca3af', strokeDasharray: '3 3' }}
              />
              
              {/* Свечи */}
              {chartData.map((entry, index) => {
                const barWidth = Math.max(10, dimensions.width / chartData.length / 2);
                const x = 30 + index * (dimensions.width - 60) / Math.max(chartData.length - 1, 1);
                
                return (
                  <CustomCandle 
                    key={`candle-${index}`} 
                    x={x} 
                    y={dimensions.height - 40}
                    width={barWidth}
                    height={dimensions.height - 60}
                    payload={entry} 
                  />
                );
              })}
              
              {/* Линия текущей цены */}
              <ReferenceLine 
                y={currentPrice} 
                stroke={isPositive ? "#10b981" : "#ef4444"} 
                strokeDasharray="3 3"
                label={{
                  value: `Текущая: $${currentPrice.toLocaleString(undefined, { 
                    minimumFractionDigits: 2, 
                    maximumFractionDigits: 6 
                  })}`,
                  position: 'right',
                  fill: isPositive ? "#059669" : "#dc2626",
                  fontSize: 12
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
      
      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
        <div className="p-3 bg-green-50 rounded-lg">
          <p className="text-sm text-gray-500">Текущая цена</p>
          <p className="font-bold text-green-700">${currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}</p>
        </div>
        <div className="p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-gray-500">Изменение за период</p>
          <p className={`font-bold ${isPositive ? 'text-green-700' : 'text-red-700'}`}>
            {isPositive ? '+' : ''}{priceChangePercent.toFixed(2)}%
          </p>
        </div>
        <div className="p-3 bg-purple-50 rounded-lg">
          <p className="text-sm text-gray-500">Максимум</p>
          <p className="font-bold text-purple-700">${Math.max(...chartData.map(c => c.h)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}</p>
        </div>
        <div className="p-3 bg-amber-50 rounded-lg">
          <p className="text-sm text-gray-500">Минимум</p>
          <p className="font-bold text-amber-700">${Math.min(...chartData.map(c => c.l)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}</p>
        </div>
      </div>
    </div>
  );
};

export default CryptoChart;