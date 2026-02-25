// AI-powered insights and recommendations

import { apiCache, computationCache } from './performance';

// AI Pattern Recognition Engine
class AIInsightsEngine {
  constructor() {
    this.patterns = new Map();
    this.insights = [];
  }

  // Analyze consumption patterns
  analyzeConsumptionPatterns(consumptionData) {
    const cacheKey = `patterns_${JSON.stringify(consumptionData)}`;
    const cached = computationCache.get(cacheKey);
    if (cached) return cached;

    const patterns = {
      weeklyTrends: this.analyzeWeeklyTrends(consumptionData),
      timePreferences: this.analyzeTimePreferences(consumptionData),
      caffeineTolerancePattern: this.analyzeCaffeineTolerancePattern(consumptionData),
      spendingHabits: this.analyzeSpendingHabits(consumptionData),
      streakPrediction: this.predictStreakContinuation(consumptionData)
    };

    computationCache.set(cacheKey, patterns);
    return patterns;
  }

  analyzeWeeklyTrends(data) {
    const weekdayData = Array(7).fill(0).map(() => ({ total: 0, count: 0 }));
    
    data.forEach(day => {
      const date = new Date(day.date);
      const weekday = date.getDay();
      weekdayData[weekday].total += day.drinks.length;
      weekdayData[weekday].count += 1;
    });

    return weekdayData.map((day, index) => {
      // Change order: start with Monday, end with Sunday
      const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      const dayIndex = (index + 6) % 7; // 0=Sunday -> 6, 1=Monday -> 0, ...
      return {
        day: days[dayIndex],
        average: day.count > 0 ? (day.total / day.count).toFixed(1) : 0,
        trend: this.calculateTrend(day.total, day.count)
      };
    });
  }

  analyzeTimePreferences(data) {
    const timeSlots = {
      morning: { count: 0, percentage: 0 },   // 5:00 - 11:59
      afternoon: { count: 0, percentage: 0 }, // 12:00 - 17:59
      evening: { count: 0, percentage: 0 }   // 18:00 - 4:59
    };

    let totalDrinksWithTime = 0;
    
    data.forEach(day => {
      day.drinks.forEach(drink => {
        if (drink.timestamp) {
          totalDrinksWithTime++;
          const hour = new Date(drink.timestamp).getHours();
          
          if (hour >= 5 && hour < 12) {
            timeSlots.morning.count++;
          } else if (hour >= 12 && hour < 18) {
            timeSlots.afternoon.count++;
          } else {
            timeSlots.evening.count++;
          }
        }
      });
    });

    if (totalDrinksWithTime > 0) {
      timeSlots.morning.percentage = ((timeSlots.morning.count / totalDrinksWithTime) * 100).toFixed(1);
      timeSlots.afternoon.percentage = ((timeSlots.afternoon.count / totalDrinksWithTime) * 100).toFixed(1);
      timeSlots.evening.percentage = ((timeSlots.evening.count / totalDrinksWithTime) * 100).toFixed(1);
    } else {
      // Fallback to basic distribution if no timestamps exist yet
      const totalDrinks = data.reduce((sum, day) => sum + day.drinks.length, 0);
      if (totalDrinks > 0) {
        timeSlots.morning.percentage = "40.0";
        timeSlots.afternoon.percentage = "40.0";
        timeSlots.evening.percentage = "20.0";
      }
    }

    return timeSlots;
  }

  analyzeCaffeineTolerancePattern(data) {
    const totalCaffeine = data.reduce((sum, day) => sum + (day.totalCaffeine || 0), 0);
    const totalDays = data.length;
    const averageDaily = totalDays > 0 ? totalCaffeine / totalDays : 0;

    let toleranceLevel = 'Low';
    let recommendation = 'Maintain current levels';

    if (averageDaily > 400) {
      toleranceLevel = 'High';
      recommendation = 'Consider reducing intake gradually to reset tolerance';
    } else if (averageDaily > 200) {
      toleranceLevel = 'Moderate';
      recommendation = 'Good balance, but monitor your sleep quality';
    }

    return {
      level: toleranceLevel,
      averageDaily: averageDaily.toFixed(1),
      recommendation,
      riskLevel: this.calculateRiskLevel(averageDaily)
    };
  }

  analyzeSpendingHabits(data) {
    const totalCost = data.reduce((sum, day) => sum + (day.totalCost || 0), 0);
    const totalDrinks = data.reduce((sum, day) => sum + day.drinks.length, 0);
    const averageCostPerDrink = totalDrinks > 0 ? totalCost / totalDrinks : 0;
    
    // Weighted monthly projection based on last 7 days vs overall
    const totalDays = data.length || 1;
    const recentData = data.slice(-7);
    const recentCost = recentData.reduce((sum, day) => sum + (day.totalCost || 0), 0);
    const recentAvg = recentData.length > 0 ? recentCost / recentData.length : totalCost / totalDays;
    
    const monthlyProjection = recentAvg * 30;
    const annualProjection = monthlyProjection * 12;

    return {
      totalSpent: totalCost.toFixed(2),
      averagePerDrink: averageCostPerDrink.toFixed(2),
      monthlyProjection: monthlyProjection.toFixed(2),
      annualProjection: annualProjection.toFixed(2),
      savingsOpportunity: this.calculateSavingsOpportunity(averageCostPerDrink)
    };
  }

  predictStreakContinuation(data) {
    const recentDays = data.slice(-14); // Analyze last 2 weeks
    const activeDays = recentDays.filter(day => day.drinks.length > 0).length;
    const consistency = activeDays / (recentDays.length || 1);
    
    let probability = 'Low';
    if (consistency > 0.85) probability = 'Very High';
    else if (consistency > 0.7) probability = 'High';
    else if (consistency > 0.4) probability = 'Medium';

    return {
      probability,
      consistency: (consistency * 100).toFixed(1),
      recommendation: this.getStreakRecommendation(consistency)
    };
  }

  calculateTrend(total, count) {
    if (count < 2) return 'neutral';
    const average = total / count;
    if (average > 2) return 'increasing';
    if (average < 1) return 'decreasing';
    return 'stable';
  }

  calculateRiskLevel(averageDaily) {
    if (averageDaily > 500) return 'high';
    if (averageDaily > 300) return 'medium';
    return 'low';
  }

  calculateSavingsOpportunity(averageCost) {
    if (averageCost > 3.5) return 'Consider buying in bulk for savings';
    if (averageCost > 3.0) return 'Look for promotions and discounts';
    return 'You\'re getting good value!';
  }

  getStreakRecommendation(consistency) {
    if (consistency > 0.8) return 'Great consistency! Keep it up!';
    if (consistency > 0.5) return 'Try to maintain daily tracking';
    return 'Set reminders to improve consistency';
  }

  // Generate AI-powered personalized quotes
  generatePersonalizedQuote(patterns, currentLevel) {
    const quotes = {
      high: [
        "Your energy mastery is legendary! Channel that power wisely.",
        "You've unlocked the monster within - use this strength to conquer your goals!",
        "Peak energy warrior detected! Your dedication is inspiring."
      ],
      medium: [
        "You're building momentum! Every sip fuels your journey to greatness.",
        "Your energy discipline is growing stronger each day!",
        "Steady progress, monster warrior! Keep climbing those levels."
      ],
      low: [
        "Every legend starts with a single sip. Your journey begins now!",
        "Small steps lead to monster leaps. Keep tracking, keep growing!",
        "The path to energy mastery starts here. Stay consistent!"
      ]
    };

    const level = patterns.caffeineTolerancePattern?.level?.toLowerCase() || 'low';
    const levelQuotes = quotes[level] || quotes.low;
    return levelQuotes[Math.floor(Math.random() * levelQuotes.length)];
  }

  // Smart goal suggestions
  suggestOptimalGoals(patterns, currentGoals) {
    const suggestions = [];
    const tolerance = patterns.caffeineTolerancePattern;
    
    if (tolerance.level === 'High' && tolerance.riskLevel === 'high') {
      suggestions.push({
        type: 'reduction',
        title: 'Gradual Reduction Recommended',
        description: `Consider reducing daily intake by 50mg to improve tolerance`,
        targetValue: Math.max(300, parseFloat(tolerance.averageDaily) - 50)
      });
    }

    if (patterns.streakPrediction.probability === 'High') {
      suggestions.push({
        type: 'streak',
        title: 'Streak Challenge',
        description: 'You\'re on fire! Challenge yourself to reach 30 days',
        targetValue: 30
      });
    }

    if (parseFloat(patterns.spendingHabits.averagePerDrink) > 3.5) {
      suggestions.push({
        type: 'savings',
        title: 'Cost Optimization',
        description: 'Try bulk purchases to reduce cost per drink',
        targetValue: 3.0
      });
    }

    return suggestions;
  }

  // Predictive analytics for optimal consumption times
  predictOptimalConsumptionTimes(patterns) {
    const timePrefs = patterns.timePreferences;
    const recommendations = [];

    if (parseFloat(timePrefs.morning.percentage) > 50) {
      recommendations.push({
        time: 'morning',
        reason: 'Peak productivity hours',
        suggestion: 'Perfect timing for maximum energy boost!'
      });
    }

    if (parseFloat(timePrefs.evening.percentage) > 30) {
      recommendations.push({
        time: 'evening',
        reason: 'May affect sleep quality',
        suggestion: 'Consider switching to earlier consumption'
      });
    }

    return recommendations;
  }
}

// Global AI engine instance
export const aiEngine = new AIInsightsEngine();

// Cached AI insights hook
export const useAIInsights = (consumptionData, currentLevel) => {
  const cacheKey = `ai_insights_${JSON.stringify(consumptionData)}_${currentLevel?.level}`;
  
  let insights = apiCache.get(cacheKey);
  
  if (!insights) {
    const patterns = aiEngine.analyzeConsumptionPatterns(consumptionData);
    insights = {
      patterns,
      personalizedQuote: aiEngine.generatePersonalizedQuote(patterns, currentLevel),
      goalSuggestions: aiEngine.suggestOptimalGoals(patterns, {}),
      timeRecommendations: aiEngine.predictOptimalConsumptionTimes(patterns),
      riskAssessment: {
        level: patterns.caffeineTolerancePattern.riskLevel,
        recommendation: patterns.caffeineTolerancePattern.recommendation
      }
    };
    
    apiCache.set(cacheKey, insights);
  }
  
  return insights;
};

// Real-time pattern detection
export const detectConsumptionAnomalies = (consumptionData) => {
  const recent = consumptionData.slice(-7);
  const historical = consumptionData.slice(0, -7);
  
  if (historical.length < 7) return null;
  
  const recentAvg = recent.reduce((sum, day) => sum + day.drinks.length, 0) / recent.length;
  const historicalAvg = historical.reduce((sum, day) => sum + day.drinks.length, 0) / historical.length;
  
  const change = ((recentAvg - historicalAvg) / historicalAvg) * 100;
  
  if (Math.abs(change) > 50) {
    return {
      type: change > 0 ? 'increase' : 'decrease',
      magnitude: Math.abs(change).toFixed(1),
      recommendation: change > 0 
        ? 'Significant increase detected. Monitor for side effects.'
        : 'Significant decrease detected. Ensure adequate energy levels.'
    };
  }
  
  return null;
};