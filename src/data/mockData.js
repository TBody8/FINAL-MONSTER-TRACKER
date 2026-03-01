// Mock data for Monster Tracker app

// Arreglo para que el id sea string (por compatibilidad con backend)
export const monsterDrinks = [
  {
    id: "2",
    name: "Monster Energy Zero Ultra",
    caffeine: 140,
    calories: 10,
    sugar: 0,
    size: "16 fl oz",
    image: "/monster-images/monster-white.webp",
    category: "Zero Sugar",
    color: "#ffffff",
    defaultPrice: 1.80
  },
  {
    id: "3",
    name: "Monster Energy Mango Loco",
    caffeine: 160,
    calories: 25,
    sugar: 6,
    size: "15.5 fl oz",
    image: "/monster-images/monster-mangoloco.webp",
    category: "Juice",
    color: "#ffff00",
    defaultPrice: 1.80
  },
  {
    id: "1",
    name: "Monster Energy Original",
    caffeine: 160,
    calories: 210,
    sugar: 54,
    size: "16 fl oz",
    image: "/monster-images/monster-original.webp",
    category: "Original",
    color: "#00ff41",
    defaultPrice: 1.80
  },
  {
    id: "7",
    name: "Monster Energy Ultra Rosa",
    caffeine: 150,
    calories: 10,
    sugar: 0,
    size: "16 fl oz",
    image: "/monster-images/monster-rosa.webp",
    category: "Ultra",
    color: "#ff66cc",
    defaultPrice: 1.80
  },
  {
    id: "4",
    name: "Monster Energy Pipeline Punch",
    caffeine: 160,
    calories: 210,
    sugar: 51,
    size: "16 fl oz",
    image: "/monster-images/monster-punch.webp",
    category: "Juice",
    color: "#ff6b35",
    defaultPrice: 1.80
  },
  {
    id: "5",
    name: "Monster Energy Ultra Red",
    caffeine: 140,
    calories: 10,
    sugar: 0,
    size: "16 fl oz",
    image: "/monster-images/monster-red.webp",
    category: "Ultra",
    color: "#ff0000",
    defaultPrice: 1.80
  },
  {
    id: "6",
    name: "Monster Energy Ultra Paradise",
    caffeine: 140,
    calories: 10,
    sugar: 0,
    size: "16 fl oz",
    image: "/monster-images/monster-paradise.webp",
    category: "Ultra",
    color: "#00ffff",
    defaultPrice: 1.80
  },
  {
    id: "8",
    name: "Monster Energy Ultra Gold",
    caffeine: 150,
    calories: 10,
    sugar: 0,
    size: "16 fl oz",
    image: "/monster-images/monster-gold.webp",
    category: "Ultra",
    color: "#ffd700",
    defaultPrice: 1.80
  }
];

export const monsterLevels = [
  { level: 1, name: "Energy Rookie", minCaffeine: 0, maxCaffeine: 160, color: "#4ade80", badge: "🟢" },
  { level: 2, name: "Monster Warrior", minCaffeine: 161, maxCaffeine: 320, color: "#eab308", badge: "🟡" },
  { level: 3, name: "Caffeine Champion", minCaffeine: 321, maxCaffeine: 480, color: "#f97316", badge: "🟠" },
  { level: 4, name: "Energy Master", minCaffeine: 481, maxCaffeine: 640, color: "#ef4444", badge: "🔴" },
  { level: 5, name: "Monster Legend", minCaffeine: 641, maxCaffeine: 999999, color: "#8b5cf6", badge: "🟣" }
];

export const mockQuotes = [
  "Unleash the beast within!",
  "Energy is life, life is energy!",
  "Push your limits, break your barriers!",
  "Fuel your passion, ignite your dreams!",
  "Conquer the chaos, command the energy!",
  "Awaken the giant within!",
  "No excuses, only peak performance!",
  "Where others stop, you accelerate!",
  "Real energy for real challenges!",
  "Break the mold, destroy the ordinary!",
  "Your will is the engine, this is the spark!",
  "Don't just survive the day, devour it!",
  "Born to stand out, driven to win!",
  "Let your energy speak louder than words!",
  "Victory favors the ones who never fade!",
  "Ignite your instinct, release your power!",
  "Turn your fatigue into fuel!",
  "Climb higher, reach further!",
  "Live on the edge, drink without rules!",
  "Fuel for those who know no borders!",
  "It’s not just energy, it’s a declaration of war!",
  "Feel the roar in every drop!",
  "For those who choose the hardest path!",
  "Your day starts when you decide!",
  "Sharp focus, total power!",
  "The secret of those who finish first!",
  "Recharge your spirit, claim your throne!",
  "Let nothing stop your path to the top!",
  "Raw power with a defined purpose!",
  "Master your destiny, be unstoppable!",
  "Crush your goals, silence the doubts!",
  "Beyond limits lies your greatness!",
  "Electrify your soul, dominate the day!",
  "The grind never stops, neither do you!",
  "Be legendary, be unstoppable!",
  "Transform energy into victory!",
  "Rise above, stay energized!",
  "Power through every challenge!",
  "Your potential is limitless!",
  "Energize your journey to greatness!"
];

export const mockConsumptionData = [
  { date: "2025-01-01", drinks: [{ id: "1", price: 2.99 }, { id: "2", price: 3.29 }], totalCaffeine: 300, totalCost: 6.28 },
  { date: "2025-01-02", drinks: [{ id: "1", price: 2.99 }], totalCaffeine: 160, totalCost: 2.99 },
  { date: "2025-01-03", drinks: [{ id: "3", price: 3.49 }, { id: "4", price: 3.29 }], totalCaffeine: 300, totalCost: 6.78 },
  { date: "2025-01-04", drinks: [{ id: "2", price: 3.29 }, { id: "5", price: 3.49 }], totalCaffeine: 300, totalCost: 6.78 },
  { date: "2025-01-05", drinks: [{ id: "1", price: 2.99 }, { id: "1", price: 2.99 }], totalCaffeine: 320, totalCost: 5.98 },
  { date: "2025-01-06", drinks: [{ id: "6", price: 3.29 }], totalCaffeine: 140, totalCost: 3.29 },
  { date: "2025-01-07", drinks: [{ id: "1", price: 2.99 }, { id: "3", price: 3.49 }, { id: "4", price: 3.29 }], totalCaffeine: 460, totalCost: 9.77 },
  { date: "2024-12-15", drinks: [{ id: "1", price: 2.99 }], totalCaffeine: 160, totalCost: 2.99 },
  { date: "2024-11-20", drinks: [{ id: "2", price: 3.29 }, { id: "3", price: 3.49 }], totalCaffeine: 300, totalCost: 6.78 },
  { date: "2024-10-10", drinks: [{ id: "4", price: 3.29 }], totalCaffeine: 140, totalCost: 3.29 }
];

export const getMonsterLevel = (totalCaffeine) => {
  // Ensure we don't have negative caffeine values
  const safeCaffeine = Math.max(0, totalCaffeine);
  return monsterLevels.find(level => 
    safeCaffeine >= level.minCaffeine && safeCaffeine <= level.maxCaffeine
  ) || monsterLevels[0];
};

export const getTodayQuote = () => {
  const today = new Date().getDate();
  return mockQuotes[today % mockQuotes.length];
};

// Helper to normalize dates to midnight UTC for reliable comparisons
const normalizeDate = (date) => {
  const d = new Date(date);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
};

export const calculateStreak = (consumptionData) => {
  if (!consumptionData || consumptionData.length === 0) return 0;
  
  // Only consider days with at least one drink
  const daysWithDrinks = consumptionData.filter(d => d.drinks && d.drinks.length > 0);
  if (daysWithDrinks.length === 0) return 0;

  const sortedDates = daysWithDrinks
    .map(d => normalizeDate(d.date))
    .sort((a, b) => b - a);
  
  let streak = 0;
  let today = normalizeDate(new Date());
  let lastDate = today;

  // Check if we have consumption today
  const hasConsumptionToday = sortedDates.includes(today);
  
  if (!hasConsumptionToday) {
    // If no consumption today, check yesterday
    const yesterday = today - (1000 * 60 * 60 * 24);
    if (!sortedDates.includes(yesterday)) {
      return 0; // Streak broken
    }
    lastDate = yesterday;
  }

  for (let date of sortedDates) {
    if (date > lastDate) continue; // Skip future dates if any

    const diffTime = lastDate - date;
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 1) {
      if (diffDays === 1 || (diffDays === 0 && streak === 0)) {
        streak++;
        lastDate = date;
      }
    } else {
      break;
    }
  }
  
  return streak;
};

export const calculateBestStreak = (consumptionData) => {
  if (!consumptionData || consumptionData.length === 0) return 0;
  
  const daysWithDrinks = consumptionData.filter(d => d.drinks && d.drinks.length > 0);
  if (daysWithDrinks.length === 0) return 0;

  const sortedDates = daysWithDrinks
    .map(d => normalizeDate(d.date))
    .sort((a, b) => a - b);
  
  let bestStreak = 0;
  let currentStreak = 1;
  
  for (let i = 1; i < sortedDates.length; i++) {
    const prevDate = sortedDates[i - 1];
    const currentDate = sortedDates[i];
    const diffTime = currentDate - prevDate;
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      currentStreak++;
    } else if (diffDays > 1) {
      bestStreak = Math.max(bestStreak, currentStreak);
      currentStreak = 1;
    }
  }
  
  bestStreak = Math.max(bestStreak, currentStreak);
  return bestStreak;
};

// Helper function to ensure positive values for charts
export const sanitizeChartData = (data) => {
  return data.map(value => Math.max(0, value || 0));
};

// Helper function to get data for charts with full time period
export const getChartData = (consumptionData, viewType = 'daily', monthOffset = 0) => {
  const currentDate = new Date();
  
  // Apply month offset accurately (handles going back across years)
  let targetYear = currentDate.getFullYear();
  let targetMonth = currentDate.getMonth() + monthOffset;
  
  // Normalize the month/year if offset pushes it out of the 0-11 bounds
  while (targetMonth < 0) {
    targetMonth += 12;
    targetYear -= 1;
  }
  while (targetMonth > 11) {
    targetMonth -= 12;
    targetYear += 1;
  }
  
  if (viewType === 'daily') {
    // Get all days in target month (1 to 28/30/31)
    const daysInMonth = new Date(targetYear, targetMonth + 1, 0).getDate();
    const fullMonthData = [];
    
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${targetYear}-${String(targetMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayData = consumptionData.find(d => d.date === dateStr);
      
      fullMonthData.push({
        date: dateStr,
        drinkCount: dayData ? dayData.drinks.length : 0,
        caffeine: dayData ? dayData.totalCaffeine : 0,
        cost: dayData ? dayData.totalCost : 0,
        label: day.toString()
      });
    }
    
    return fullMonthData;
  } else {
    // Annual view - show all 12 months with totals and daily averages
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const annualData = [];
    
    for (let month = 0; month < 12; month++) {
      const daysInThisMonth = new Date(targetYear, month + 1, 0).getDate();
      
      const monthData = consumptionData.filter(d => {
        const date = new Date(d.date);
        return date.getFullYear() === targetYear && date.getMonth() === month;
      });
      
      const totalDrinks = monthData.reduce((sum, d) => sum + d.drinks.length, 0);
      const totalCaffeine = monthData.reduce((sum, d) => sum + d.totalCaffeine, 0);
      const totalCost = monthData.reduce((sum, d) => sum + (d.totalCost || 0), 0);
      
      // Calculate daily average for this month
      const avgDrinks = (totalDrinks / daysInThisMonth).toFixed(2);
      const avgCaffeine = (totalCaffeine / daysInThisMonth).toFixed(1);
      
      annualData.push({
        month: month,
        drinkCount: totalDrinks,
        caffeine: totalCaffeine,
        cost: totalCost,
        avgDrinks: avgDrinks,
        avgCaffeine: avgCaffeine,
        label: monthNames[month]
      });
    }
    
    return annualData;
  }
};

// Helper function to calculate total caffeine consumed overall
export const calculateTotalCaffeine = (consumptionData) => {
  return Math.max(0, consumptionData.reduce((sum, day) => sum + (day.totalCaffeine || 0), 0));
};

// Helper function to calculate total money spent
export const calculateTotalCost = (consumptionData) => {
  return Math.max(0, consumptionData.reduce((sum, day) => sum + (day.totalCost || 0), 0));
};

// Helper function to calculate total drinks consumed
export const calculateTotalDrinks = (consumptionData) => {
  return consumptionData.reduce((sum, day) => sum + (day.drinks?.length || 0), 0);
};