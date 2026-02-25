import React, { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  Target,
  Trophy,
  Zap,
  TrendingUp,
  Settings,
  Coffee,
  Award,
  Flame,
  Trash2,
  X,
  DollarSign,
  ShoppingCart,
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { debounce } from '../utils/performance';
import * as mockData from '../data/mockData';

// Lazy load non-critical components
const DrinkSelector = lazy(() => import('./DrinkSelector'));
const AIInsightsPanel = lazy(() => import('./AIInsightsPanel'));

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const getMonsterLevel = mockData.getMonsterLevel;
const calculateStreak = mockData.calculateStreak;
const getTodayQuote = mockData.getTodayQuote;
const getChartData = mockData.getChartData;
const calculateTotalCaffeine = mockData.calculateTotalCaffeine;
const calculateBestStreak = mockData.calculateBestStreak;
const calculateTotalCost = mockData.calculateTotalCost;
const calculateTotalDrinks = mockData.calculateTotalDrinks;

// Mapeo de nombres completos a nombres resumidos para el tooltip
const monsterNameShortMap = {
  'Monster Energy Original': 'Original',
  'Monster Energy Zero Ultra': 'White',
  'Monster Energy Mango Loco': 'MangoLoco',
  'Monster Energy Pipeline Punch': 'Pipeline',
  'Monster Energy Ultra Red': 'Ultra Red',
  'Monster Energy Ultra Paradise': 'Green',
};

const Dashboard = React.memo(
  ({
    consumptionData,
    goals,
    bestStreak,
    setBestStreak,
    onDrinkDelete,
    onDrinkSelect,
    selectedDrinks,
  }) => {
    const [chartView, setChartView] = useState('daily');
    const [todayQuote, setTodayQuote] = useState('');
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [deletingDrink, setDeletingDrink] = useState(null);
    const [showAIInsights, setShowAIInsights] = useState(true);
    const chartRef = useRef(null);

    useEffect(() => {
      setTodayQuote(mockData.getTodayQuote());
    }, []);

    // Debounced best streak update to prevent excessive recalculations
    const debouncedUpdateBestStreak = useRef(
      debounce((data, currentBest, setter) => {
        const currentBestStreak = mockData.calculateBestStreak(data);
        setter(currentBestStreak);
      }, 300)
    ).current;

    useEffect(() => {
      debouncedUpdateBestStreak(consumptionData, bestStreak, setBestStreak);
    }, [consumptionData, bestStreak, setBestStreak, debouncedUpdateBestStreak]);

    const today = new Date().toISOString().split('T')[0];
    const todayData = consumptionData.find((d) => d.date === today) || {
      drinks: [],
      totalCaffeine: 0,
      totalCost: 0,
    };

    // Memoize expensive calculations
    const memoizedStats = React.useMemo(
      () => ({
        totalCaffeine: mockData.calculateTotalCaffeine(consumptionData),
        totalDrinks: mockData.calculateTotalDrinks(consumptionData),
        totalCost: mockData.calculateTotalCost(consumptionData),
        currentLevel: mockData.getMonsterLevel(todayData.totalCaffeine),
        streak: mockData.calculateStreak(consumptionData),
      }),
      [consumptionData, todayData.totalCaffeine]
    );

    const handleChartViewChange = React.useCallback(
      async (newView) => {
        if (newView === chartView) return;

        setIsTransitioning(true);

        // Small delay to allow for smooth transition
        setTimeout(() => {
          setChartView(newView);
          setIsTransitioning(false);
        }, 150);
      },
      [chartView]
    );

    const handleDeleteDrink = React.useCallback(
      async (drinkIndex) => {
        setDeletingDrink(drinkIndex);

        // Add smooth animation delay
        await new Promise((resolve) => setTimeout(resolve, 300));

        if (onDrinkDelete) {
          onDrinkDelete(drinkIndex);
        }

        setDeletingDrink(null);
      },
      [onDrinkDelete]
    );

    // Memoize chart data to prevent unnecessary recalculations
    const chartData_full = React.useMemo(
      () => mockData.getChartData(consumptionData, chartView),
      [consumptionData, chartView]
    );

    const chartData = React.useMemo(
      () => ({
        labels: chartData_full.map((d) => d.label),
        datasets: [
          {
            label: 'Monster Drinks',
            data: chartData_full.map((d) => d.drinkCount),
            borderColor: '#00ff41',
            backgroundColor: 'rgba(0, 255, 65, 0.1)',
            tension: 0.4,
            fill: false,
            borderWidth: 3,
            pointRadius: 5,
            pointHoverRadius: 7,
            pointBackgroundColor: '#00ff41',
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2,
            pointHoverBackgroundColor: '#00ff41',
            pointHoverBorderColor: '#ffffff',
            pointHoverBorderWidth: 3,
          },
        ],
      }),
      [chartData_full]
    );

    const chartOptions = React.useMemo(
      () => ({
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          intersect: false,
          mode: 'index',
        },
        plugins: {
          legend: {
            display: false,
          },
          title: {
            display: true,
            text: `${
              chartView === 'daily' ? 'Daily' : 'Annual'
            } Monster Consumption`,
            color: '#ffffff',
            font: {
              size: 20,
              weight: 'bold',
              family: 'Teko, sans-serif',
            },
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            titleColor: '#00ff41',
            bodyColor: '#ffffff',
            borderColor: '#00ff41',
            borderWidth: 1,
            cornerRadius: 8,
            titleFont: {
              size: 14,
              weight: 'bold',
            },
            bodyFont: {
              size: 13,
            },
            callbacks: {
              label: function (context) {
                const value = Math.max(0, context.parsed.y);
                const dataIndex = context.dataIndex;
                const chartDataEntry = chartData_full[dataIndex];
                
                if (chartView === 'annual' && chartDataEntry) {
                  return [
                    `Total: ${chartDataEntry.drinkCount} Monsters`,
                    `Avg: ${chartDataEntry.avgDrinks} per day`
                  ];
                }
                let monsterNames = '';
                if (
                  chartView === 'daily' &&
                  chartDataEntry &&
                  chartDataEntry.date
                ) {
                  // Buscar en consumptionData el día y obtener los nombres
                  const dayData = consumptionData.find(
                    (d) => d.date === chartDataEntry.date
                  );
                  if (dayData && dayData.drinks && dayData.drinks.length > 0) {
                    monsterNames = dayData.drinks
                      .map((drink) => {
                        const drinkInfo = mockData.monsterDrinks.find(
                          (m) => m.id === drink.id
                        );
                        return drinkInfo
                          ? monsterNameShortMap[drinkInfo.name] || 'Monster'
                          : 'Monster';
                      })
                      .join('\n'); // Mostrar cada Monster en una línea
                  }
                }
                let label = `${value}`;
                if (monsterNames) {
                  // Si hay nombres, devolver solo los nombres, sin el número arriba
                  const namesArr = monsterNames.split('\n');
                  // Contar cuántas veces aparece cada Monster
                  const counts = {};
                  namesArr.forEach((name) => {
                    counts[name] = (counts[name] || 0) + 1;
                  });
                  // Construir el array con el formato: Nombre xN si hay más de uno
                  const formatted = Object.entries(counts).map(
                    ([name, count]) => (count > 1 ? `${name} x${count}` : name)
                  );
                  // Añadir coma al final de cada línea excepto la última si hay más de una Monster
                  if (formatted.length > 1) {
                    return formatted.map((name, idx) =>
                      idx < formatted.length - 1 ? name + ',' : name
                    );
                  } else {
                    return formatted;
                  }
                }
                return label;
              },
            },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            min: 0,
            grid: {
              color: 'rgba(255, 255, 255, 0.05)',
              drawBorder: false,
            },
            border: {
              display: false,
            },
            ticks: {
              color: '#9CA3AF',
              font: {
                size: 11,
                family: 'Inter, sans-serif',
              },
              callback: function (value) {
                const safeValue = Math.max(0, Math.floor(value));
                return safeValue;
              },
              stepSize: 1,
              maxTicksLimit: 6,
            },
          },
          x: {
            grid: {
              display: false,
            },
            border: {
              display: false,
            },
            ticks: {
              color: '#9CA3AF',
              font: {
                size: 11,
                family: 'Inter, sans-serif',
              },
              maxRotation: 0,
              maxTicksLimit: chartView === 'daily' ? 15 : 12,
            },
          },
        },
        elements: {
          point: {
            hoverBackgroundColor: '#00ff41',
            hoverBorderColor: '#ffffff',
          },
          line: {
            tension: 0.4,
          },
        },
        animation: {
          duration: 1000,
          easing: 'easeInOutQuart',
        },
      }),
      [chartView, chartData_full, consumptionData]
    );

    return (
      <div className='space-y-8'>
        {/* Quote Section */}
        <motion.div
          className='bg-gradient-to-r from-green-500/20 to-green-600/20 rounded-2xl p-6 border border-green-500/30 animate-glow'
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <motion.p
            className='text-2xl font-bold text-center text-green-400 italic'
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            "{todayQuote}"
          </motion.p>
        </motion.div>

        {/* AI Insights Panel */}
        <Suspense
          fallback={
            <div className='bg-gradient-to-br from-purple-900/20 to-blue-900/20 rounded-2xl p-6 border border-purple-500/20 animate-pulse'>
              <div className='h-40 bg-gray-800/50 rounded-lg'></div>
            </div>
          }
        >
          <AIInsightsPanel
            consumptionData={consumptionData}
            currentLevel={memoizedStats.currentLevel}
            isVisible={showAIInsights}
          />
        </Suspense>

        {/* Stats Grid - Grouped Design */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6'>
          {/* Today's Monsters */}
          <motion.div
            className='bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-4 md:p-6 border border-green-500/20 hover:border-green-500/40 transition-all duration-300 hover:scale-105'
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
          >
            <div className='flex items-center gap-3 mb-4'>
              <motion.div
                className='p-2 bg-green-500 rounded-lg'
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ duration: 0.2 }}
              >
                <Coffee className='w-6 h-6 text-black' />
              </motion.div>
              <h3 className='text-sm font-semibold text-white'>
                Today's Monsters
              </h3>
            </div>
            <p className='text-2xl font-bold text-green-400'>
              {todayData.drinks.length}
            </p>
            <p className='text-xs text-gray-400 mt-1'>drinks consumed</p>
          </motion.div>

          {/* Combined Caffeine Card */}
          <motion.div
            className='bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-4 md:p-6 border border-yellow-500/20 hover:border-yellow-500/40 transition-all duration-300 hover:scale-105 col-span-1 md:col-span-2'
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
          >
            <div className='flex items-center gap-3 mb-6'>
              <motion.div
                className='p-2 bg-yellow-500 rounded-lg'
                whileHover={{ scale: 1.1, rotate: -5 }}
                transition={{ duration: 0.2 }}
              >
                <Zap className='w-6 h-6 text-black' />
              </motion.div>
              <h3 className='text-lg font-semibold text-white'>
                Caffeine Tracking
              </h3>
            </div>

            <div className='grid grid-cols-2 gap-6'>
              <div className='text-center'>
                <p className='text-2xl font-bold text-yellow-400'>
                  {Math.max(0, todayData.totalCaffeine)}mg
                </p>
                <p className='text-sm text-gray-400 mt-1'>Today's Caffeine</p>
                {goals.dailyLimit && (
                  <motion.div
                    className='mt-3'
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <div className='flex justify-between text-xs text-gray-500 mb-1'>
                      <span>Goal: {goals.dailyLimit}mg</span>
                      <span>
                        {Math.round(
                          (Math.max(0, todayData.totalCaffeine) /
                            goals.dailyLimit) *
                            100
                        )}
                        %
                      </span>
                    </div>
                    <div className='w-full bg-gray-700 rounded-full h-1.5'>
                      <motion.div
                        className='bg-yellow-500 h-1.5 rounded-full transition-all duration-500'
                        style={{
                          width: `${Math.min(
                            (Math.max(0, todayData.totalCaffeine) /
                              goals.dailyLimit) *
                              100,
                            100
                          )}%`,
                        }}
                        initial={{ width: 0 }}
                        animate={{
                          width: `${Math.min(
                            (Math.max(0, todayData.totalCaffeine) /
                              goals.dailyLimit) *
                              100,
                            100
                          )}%`,
                        }}
                        transition={{ duration: 1, delay: 0.5 }}
                      />
                    </div>
                  </motion.div>
                )}
              </div>

              <div className='text-center border-l border-gray-700 pl-6'>
                <p className='text-2xl font-bold text-yellow-300'>
                  {memoizedStats.totalCaffeine}mg
                </p>
                <p className='text-sm text-gray-400 mt-1'>Total Caffeine</p>
                <p className='text-xs text-gray-500 mt-1'>All time consumed</p>
              </div>
            </div>
          </motion.div>

          {/* Total Monsters */}
          <motion.div
            className='bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 border border-cyan-500/20 hover:border-cyan-500/40 transition-all duration-300 hover:scale-105'
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3, ease: 'easeOut' }}
          >
            <div className='flex items-center gap-3 mb-4'>
              <motion.div
                className='p-2 bg-cyan-500 rounded-lg'
                whileHover={{ scale: 1.1, rotate: -5 }}
                transition={{ duration: 0.2 }}
              >
                <ShoppingCart className='w-6 h-6 text-black' />
              </motion.div>
              <h3 className='text-sm font-semibold text-white'>
                Total Monsters
              </h3>
            </div>
            <p className='text-2xl font-bold text-cyan-400'>
              {memoizedStats.totalDrinks}
            </p>
            <p className='text-xs text-gray-400 mt-1'>drinks consumed</p>
          </motion.div>

          {/* Total Money Spent */}
          <motion.div
            className='bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 border border-emerald-500/20 hover:border-emerald-500/40 transition-all duration-300 hover:scale-105'
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.4, ease: 'easeOut' }}
          >
            <div className='flex items-center gap-3 mb-4'>
              <motion.div
                className='p-2 bg-emerald-500 rounded-lg'
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ duration: 0.2 }}
              >
                <DollarSign className='w-6 h-6 text-black' />
              </motion.div>
              <h3 className='text-sm font-semibold text-white'>Money Spent</h3>
            </div>
            <p className='text-2xl font-bold text-emerald-400'>
              ${memoizedStats.totalCost.toFixed(2)}
            </p>
            <p className='text-xs text-gray-400 mt-1'>total invested</p>
          </motion.div>

          {/* Monster Level */}
          <motion.div
            className='bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 border border-blue-500/20 hover:border-blue-500/40 transition-all duration-300 hover:scale-105'
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.5, ease: 'easeOut' }}
          >
            <div className='flex items-center gap-3 mb-4'>
              <motion.div
                className='p-2 bg-blue-500 rounded-lg'
                whileHover={{ scale: 1.1, rotate: -5 }}
                transition={{ duration: 0.2 }}
              >
                <Trophy className='w-6 h-6 text-white' />
              </motion.div>
              <h3 className='text-sm font-semibold text-white'>
                Monster Level
              </h3>
            </div>
            <div className='flex items-center gap-2'>
              <motion.span
                className='text-xl'
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {memoizedStats.currentLevel.badge}
              </motion.span>
              <div>
                <p className='text-lg font-bold text-white'>
                  {memoizedStats.currentLevel.name}
                </p>
                <p className='text-xs text-gray-400'>
                  Level {memoizedStats.currentLevel.level}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Combined Streak Card */}
          <motion.div
            className='bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 border border-orange-500/20 hover:border-orange-500/40 transition-all duration-300 hover:scale-105 col-span-1 md:col-span-2 flex flex-col items-center justify-center w-full max-w-xl mx-auto my-8'
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.6, ease: 'easeOut' }}
          >
            <div className='flex flex-col items-center w-full'>
              <div className='flex items-center gap-3 mb-6'>
                <motion.div
                  className='p-2 bg-orange-500 rounded-lg'
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  <Calendar className='w-6 h-6 text-white' />
                </motion.div>
                <h3 className='text-lg font-semibold text-white'>
                  Streak Tracking
                </h3>
              </div>
              <div className='grid grid-cols-2 gap-6 w-full'>
                <div className='text-center'>
                  <p className='text-2xl font-bold text-orange-400'>
                    {memoizedStats.streak} days
                  </p>
                  <p className='text-sm text-gray-400 mt-1'>Current Streak</p>
                  <p className='text-xs text-gray-500 mt-1'>Keep it going!</p>
                </div>
                <div className='text-center border-l border-gray-700 pl-6'>
                  <p className='text-2xl font-bold text-purple-400'>
                    {bestStreak} days
                  </p>
                  <p className='text-sm text-gray-400 mt-1'>Best Streak</p>
                  <p className='text-xs text-gray-500 mt-1'>Your record!</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Chart Section */}
        <motion.div
          className='bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-4 md:p-8 border border-green-500/20 hover:border-green-500/30 transition-all duration-300'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7, ease: 'easeOut' }}
        >
          <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4'>
            <h3 className='text-2xl font-bold text-white monster-title'>
              Consumption Analytics
            </h3>
            <div className='flex gap-2'>
              <motion.button
                onClick={() => handleChartViewChange('daily')}
                className={`px-4 py-2 rounded-lg transition-all duration-300 monster-subtitle ${
                  chartView === 'daily'
                    ? 'bg-green-500 text-black shadow-lg'
                    : 'bg-gray-700 text-white hover:bg-gray-600 hover:scale-105'
                }`}
                whileHover={{ scale: chartView !== 'daily' ? 1.05 : 1 }}
                whileTap={{ scale: 0.95 }}
              >
                Daily
              </motion.button>
              <motion.button
                onClick={() => handleChartViewChange('annual')}
                className={`px-4 py-2 rounded-lg transition-all duration-300 monster-subtitle ${
                  chartView === 'annual'
                    ? 'bg-green-500 text-black shadow-lg'
                    : 'bg-gray-700 text-white hover:bg-gray-600 hover:scale-105'
                }`}
                whileHover={{ scale: chartView !== 'annual' ? 1.05 : 1 }}
                whileTap={{ scale: 0.95 }}
              >
                Annual
              </motion.button>
            </div>
          </div>

          <div className='h-96 relative'>
            <AnimatePresence mode='wait'>
              {!isTransitioning && (
                <motion.div
                  key={chartView}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4, ease: 'easeInOut' }}
                  className='h-full w-full'
                >
                  <Line
                    ref={chartRef}
                    data={chartData}
                    options={chartOptions}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {isTransitioning && (
              <div className='absolute inset-0 flex items-center justify-center'>
                <motion.div
                  className='w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full'
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                />
              </div>
            )}
          </div>
        </motion.div>

        {/* Today's Drinks - Enhanced with Delete Functionality */}
        {todayData.drinks.length > 0 && (
          <motion.div
            className='bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-4 md:p-8 border border-green-500/20'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8, ease: 'easeOut' }}
          >
            <div className='flex items-center justify-between mb-6'>
              <h3 className='text-2xl font-bold text-white monster-title'>
                Today's Monsters
              </h3>
              <p className='text-gray-400 text-sm'>Hover to remove drinks</p>
            </div>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
              <AnimatePresence>
                {todayData.drinks.map((drink, index) => {
                  const drinkData = mockData.monsterDrinks.find(
                    (d) => d.id === drink.id
                  );
                  const isDeleting = deletingDrink === index;

                  return (
                    <motion.div
                      key={`${drink.id}-${index}`}
                      className='relative group'
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{
                        opacity: 0,
                        x: -100,
                        scale: 0.8,
                        transition: { duration: 0.3 },
                      }}
                      transition={{
                        duration: 0.5,
                        delay: index * 0.1,
                        ease: 'easeOut',
                      }}
                      layout
                    >
                      <div
                        className={`flex items-center gap-4 bg-gray-800 rounded-lg p-4 hover:bg-gray-700 transition-all duration-300 ${
                          isDeleting
                            ? 'bg-red-900/50 border border-red-500/50'
                            : ''
                        }`}
                      >
                        <motion.img
                          src={drinkData?.image}
                          alt={drinkData?.name}
                          className='w-12 h-12 rounded object-cover'
                          whileHover={{ scale: 1.1 }}
                          transition={{ duration: 0.2 }}
                          loading='lazy'
                        />
                        <div className='flex-1'>
                          <p className='text-white font-semibold'>
                            {drinkData?.name}
                          </p>
                          <div className='flex items-center gap-4 text-sm'>
                            <p className='text-green-400'>
                              {drinkData?.caffeine}mg caffeine
                            </p>
                            <p className='text-yellow-400'>
                              ${drink.price?.toFixed(2) || '0.00'}
                            </p>
                          </div>
                        </div>

                        {/* Delete Button */}
                        <motion.button
                          onClick={() => handleDeleteDrink(index)}
                          className='opacity-0 group-hover:opacity-100 p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all duration-200'
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          disabled={isDeleting}
                          title='Remove this drink'
                        >
                          {isDeleting ? (
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{
                                duration: 1,
                                repeat: Infinity,
                                ease: 'linear',
                              }}
                            >
                              <X className='w-4 h-4' />
                            </motion.div>
                          ) : (
                            <Trash2 className='w-4 h-4' />
                          )}
                        </motion.button>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            {todayData.drinks.length === 0 && (
              <motion.p
                className='text-gray-500 text-center py-8 italic'
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                No monsters consumed today. Start tracking your energy!
              </motion.p>
            )}
          </motion.div>
        )}

        {/* Track Drink Section - Moved below Today's Monsters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.9, ease: 'easeOut' }}
        >
          <Suspense
            fallback={
              <div className='bg-gradient-to-br from-gray-900 via-black to-gray-900 rounded-2xl p-8 border border-green-500/20 animate-pulse'>
                <div className='h-96 bg-gray-800/50 rounded-lg'></div>
              </div>
            }
          >
            <DrinkSelector
              onDrinkSelect={onDrinkSelect}
              selectedDrinks={selectedDrinks}
            />
          </Suspense>
        </motion.div>
      </div>
    );
  }
);

Dashboard.displayName = 'Dashboard';

export default Dashboard;
