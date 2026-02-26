import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, ArrowLeft } from 'lucide-react';
import DrinkSelector from './DrinkSelector';

const QuickAdd = ({ drinkId }) => {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState('idle'); // idle, success, error

  useEffect(() => {
    const storedToken = localStorage.getItem('monsterTrackerToken');
    const storedUser = localStorage.getItem('monsterTrackerUser');
    
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser({ username: storedUser });
    } else {
      setStatus('error');
    }
  }, []);

  const handleDrinkSelect = async (drinkWithPrice) => {
    if (!token || !user) return;
    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL || '';
      const today = new Date().toISOString().split('T')[0];
      
      const resData = await fetch(`${backendUrl}/api/consumption`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const allData = resData.ok ? await resData.json() : [];
      const todayData = allData.find(d => d.date === today) || {
        date: today,
        drinks: [],
        totalCaffeine: 0,
        totalCost: 0
      };

      const drinkPrice = drinkWithPrice.selectedPrice !== undefined ? drinkWithPrice.selectedPrice : drinkWithPrice.defaultPrice;
      const safeCaffeineAmount = Math.max(0, drinkWithPrice.caffeine || 0);
      
      const newDrinkEntry = {
        id: String(drinkWithPrice.id),
        price: drinkPrice,
        timestamp: new Date().toISOString(),
      };

      const updatedDay = {
        ...todayData,
        username: user.username,
        drinks: [...todayData.drinks, newDrinkEntry],
        totalCaffeine: todayData.totalCaffeine + safeCaffeineAmount,
        totalCost: (todayData.totalCost || 0) + drinkPrice
      };

      const saveRes = await fetch(`${backendUrl}/api/consumption`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(updatedDay)
      });

      if (!saveRes.ok) throw new Error('Failed to save');
      
      setStatus('success');
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);
    } catch(err) {
      console.error(err);
      setStatus('error');
    }
  };

  const returnToApp = () => {
    window.location.href = '/';
  };

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-green-500 mb-4">
          <CheckCircle className="w-32 h-32" />
        </motion.div>
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl font-bold text-green-400 monster-title text-center">
          Monster Added!
        </motion.h1>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white relative flex flex-col pt-4 overflow-hidden">
      {/* Background glow similar to main app */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black">
          <div className="absolute top-0 left-0 w-full h-full opacity-10" style={{ background: 'radial-gradient(circle at 20% 50%, #00ff41 0%, transparent 50%)' }} />
        </div>
      </div>
      
      <header className="relative z-10 p-4 max-w-7xl mx-auto w-full flex justify-between items-center mb-2">
        <button onClick={returnToApp} className="p-2 text-gray-400 hover:text-white bg-gray-900/50 rounded-full border border-gray-700">
          <ArrowLeft className="w-6 h-6" />
        </button>
      </header>
      
      <main className="relative z-10 flex-1 w-full max-w-7xl mx-auto px-4 md:px-8 flex flex-col justify-center pb-12">
        {status === 'error' ? (
          <div className="text-center p-8 bg-gray-900/80 rounded-2xl border border-red-500/30">
            <p className="text-red-500 text-lg mb-4">You need to be logged into the main app first.</p>
            <button onClick={returnToApp} className="text-green-400 hover:text-green-300 underline font-bold">Return to App</button>
          </div>
        ) : (
          <div className="-mt-12 md:mt-0">
            <DrinkSelector 
              initialDrinkId={drinkId}
              autoOpenModal={true}
              onDrinkSelect={handleDrinkSelect}
              selectedDrinks={[]}
              standalone={true}
            />
          </div>
        )}
      </main>
    </div>
  );
};

export default QuickAdd;
