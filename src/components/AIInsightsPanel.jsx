import React, { memo, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain,
  TrendingUp,
  Target,
  Clock,
  AlertTriangle,
  Lightbulb,
  Zap,
  Euro,
} from 'lucide-react';
import { useAIInsights, detectConsumptionAnomalies } from '../utils/aiInsights';

const AIInsightsPanel = memo(
  ({ consumptionData, currentLevel, isVisible = true }) => {
    // Memoize AI insights to prevent unnecessary recalculations
    const insights = useMemo(
      () => useAIInsights(consumptionData, currentLevel),
      [consumptionData, currentLevel]
    );

    const anomaly = useMemo(
      () => detectConsumptionAnomalies(consumptionData),
      [consumptionData]
    );

    if (!isVisible) return null;

    return (
      <AnimatePresence>
        <motion.div
          className='bg-gradient-to-br from-purple-900/20 to-blue-900/20 rounded-2xl p-4 md:p-6 border border-purple-500/20 hover:border-purple-500/40 transition-all duration-300'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          {/* Header */}
          <div className='flex items-center gap-3 mb-6'>
            <motion.div
              className='p-2 bg-purple-500 rounded-lg'
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ duration: 0.2 }}
            >
              <Brain className='w-6 h-6 text-white' />
            </motion.div>
            <h3 className='text-2xl font-bold text-white monster-title'>
              AI Insights
            </h3>
            <motion.div
              className='ml-auto text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded-full'
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              POWERED BY AI
            </motion.div>
          </div>

          {/* Personalized Quote */}
          <motion.div
            className='bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-lg p-4 mb-6 border border-purple-500/20'
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <div className='flex items-center gap-2 mb-2'>
              <Lightbulb className='w-4 h-4 text-purple-400' />
              <span className='text-sm text-purple-300 font-semibold'>
                Personalized for You
              </span>
            </div>
            <p className='text-purple-100 italic'>
              "{insights.personalizedQuote}"
            </p>
          </motion.div>

          {/* Key Metrics Grid */}
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6'>
            {/* Caffeine Tolerance */}
            <motion.div
              className='bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg p-4 border border-gray-700'
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <div className='flex items-center gap-2 mb-2'>
                <Zap className='w-4 h-4 text-yellow-400' />
                <span className='text-xs text-gray-400'>Tolerance Level</span>
              </div>
              <p className='text-lg font-bold text-white'>
                {insights.patterns.caffeineTolerancePattern.level}
              </p>
              <p className='text-xs text-gray-500'>
                {insights.patterns.caffeineTolerancePattern.averageDaily}mg
                daily avg
              </p>
            </motion.div>

            {/* Spending Habits */}
            <motion.div
              className='bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg p-4 border border-gray-700'
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
            >
              <div className='flex items-center gap-2 mb-2'>
                <Euro className='w-4 h-4 text-green-400' />
                <span className='text-xs text-gray-400'>Avg Cost/Drink</span>
              </div>
              <p className='text-lg font-bold text-white'>
                {insights.patterns.spendingHabits.averagePerDrink} €
              </p>
              <p className='text-xs text-gray-500'>
                {insights.patterns.spendingHabits.monthlyProjection} €/month
              </p>
            </motion.div>

            {/* Time Preference */}
            <motion.div
              className='bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg p-4 border border-gray-700'
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.4 }}
            >
              <div className='flex items-center gap-2 mb-2'>
                <Clock className='w-4 h-4 text-blue-400' />
                <span className='text-xs text-gray-400'>Peak Time</span>
              </div>
              <p className='text-lg font-bold text-white'>
                {Object.entries(insights.patterns.timePreferences)
                  .sort(
                    ([, a], [, b]) =>
                      parseFloat(b.percentage) - parseFloat(a.percentage)
                  )[0][0]
                  .charAt(0)
                  .toUpperCase() +
                  Object.entries(insights.patterns.timePreferences)
                    .sort(
                      ([, a], [, b]) =>
                        parseFloat(b.percentage) - parseFloat(a.percentage)
                    )[0][0]
                    .slice(1)}
              </p>
              <p className='text-xs text-gray-500'>
                {
                  Object.entries(insights.patterns.timePreferences).sort(
                    ([, a], [, b]) =>
                      parseFloat(b.percentage) - parseFloat(a.percentage)
                  )[0][1].percentage
                }
                % of intake
              </p>
            </motion.div>

            {/* Streak Prediction */}
            <motion.div
              className='bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg p-4 border border-gray-700'
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.5 }}
            >
              <div className='flex items-center gap-2 mb-2'>
                <TrendingUp className='w-4 h-4 text-purple-400' />
                <span className='text-xs text-gray-400'>Streak Potential</span>
              </div>
              <p className='text-lg font-bold text-white'>
                {insights.patterns.streakPrediction.probability}
              </p>
              <p className='text-xs text-gray-500'>
                {insights.patterns.streakPrediction.consistency}% consistent
              </p>
            </motion.div>
          </div>

          {/* AI Recommendations */}
          {insights.goalSuggestions.length > 0 && (
            <motion.div
              className='bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg p-4 mb-4 border border-blue-500/20'
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.6 }}
            >
              <div className='flex items-center gap-2 mb-3'>
                <Target className='w-4 h-4 text-blue-400' />
                <span className='text-sm text-blue-300 font-semibold'>
                  Smart Recommendations
                </span>
              </div>
              <div className='space-y-2'>
                {insights.goalSuggestions
                  .slice(0, 2)
                  .map((suggestion, index) => (
                    <motion.div
                      key={index}
                      className='bg-black/20 rounded p-3'
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.7 + index * 0.1 }}
                    >
                      <p className='text-sm font-semibold text-white'>
                        {suggestion.title}
                      </p>
                      <p className='text-xs text-gray-300'>
                        {suggestion.description}
                      </p>
                    </motion.div>
                  ))}
              </div>
            </motion.div>
          )}

          {/* Anomaly Detection */}
          {anomaly && (
            <motion.div
              className='bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-lg p-4 border border-orange-500/20'
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.8 }}
            >
              <div className='flex items-center gap-2 mb-2'>
                <AlertTriangle className='w-4 h-4 text-orange-400' />
                <span className='text-sm text-orange-300 font-semibold'>
                  Pattern Alert
                </span>
              </div>
              <p className='text-sm text-white'>
                {anomaly.magnitude}% {anomaly.type} detected in recent
                consumption
              </p>
              <p className='text-xs text-gray-300 mt-1'>
                {anomaly.recommendation}
              </p>
            </motion.div>
          )}

          {/* Weekly Trends Mini Chart */}
          <motion.div
            className='mt-4 bg-gradient-to-r from-gray-800/50 to-gray-900/50 rounded-lg p-4 border border-gray-700/50'
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.9 }}
          >
            <div className='flex items-center gap-2 mb-3'>
              <TrendingUp className='w-4 h-4 text-green-400' />
              <span className='text-sm text-gray-300 font-semibold'>
                Weekly Pattern
              </span>
            </div>
            <div className='grid grid-cols-7 gap-1'>
              {[
                'Monday',
                'Tuesday',
                'Wednesday',
                'Thursday',
                'Friday',
                'Saturday',
                'Sunday',
              ].map((weekday) => {
                const day = insights.patterns.weeklyTrends.find(
                  (d) => d.day === weekday
                ) || { day: weekday, average: 0 };
                return (
                  <div key={weekday} className='text-center'>
                    <div className='text-xs text-gray-500 mb-1'>
                      {day.day.slice(0, 3)}
                    </div>
                    <div
                      className='bg-green-500 rounded h-2 transition-all duration-300'
                      style={{
                        opacity: Math.min(parseFloat(day.average) / 3, 1),
                        height: `${Math.max(8, parseFloat(day.average) * 8)}px`,
                      }}
                    />
                    <div className='text-xs text-gray-400 mt-1'>
                      {day.average}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  }
);

AIInsightsPanel.displayName = 'AIInsightsPanel';

export default AIInsightsPanel;
