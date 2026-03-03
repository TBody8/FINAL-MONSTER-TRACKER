import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Trophy, Flame, Coins, CheckCircle2, Zap } from 'lucide-react';
import Loader from './ui/Loader';
import { monsterDrinks } from '../data/mockData';

const getDrinkName = (id) => monsterDrinks.find(d => String(d.id) === String(id))?.name || 'Unknown';
const getShortName = (name) => name ? name.replace(/Monster Energy /gi, "").trim() : "";

const RankBadge = ({ rank }) => {
  let badgeClasses = "";
  let textClasses = "";
  
  if (rank === 1) {
    badgeClasses = "bg-yellow-500/20 border-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.5)]";
    textClasses = "text-yellow-400";
  } else if (rank === 2) {
    badgeClasses = "bg-gray-300/20 border-gray-300 shadow-[0_0_15px_rgba(209,213,219,0.3)]";
    textClasses = "text-gray-200";
  } else if (rank === 3) {
    badgeClasses = "bg-amber-700/30 border-amber-600 shadow-[0_0_15px_rgba(217,119,6,0.2)]";
    textClasses = "text-amber-500";
  } else {
    return null; // Don't show numeric badge for ranks > 3 as requested
  }

  return (
    <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-black ${badgeClasses}`}>
      <span className={textClasses}>{rank}</span>
    </div>
  );
};

export default function Leaderboard({ onClose, token }) {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const backendUrl = process.env.REACT_APP_BACKEND_URL || '';
        const res = await fetch(`${backendUrl}/api/leaderboard`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (!res.ok) throw new Error('Failed to fetch Leaderboard data');
        
        const data = await res.json();
        setLeaderboardData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [token]);

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm'>
      <motion.div 
        className='bg-[#0d0d0d] w-full max-w-4xl max-h-[90vh] rounded-3xl border border-yellow-500/30 shadow-[0_0_50px_rgba(234,179,8,0.15)] overflow-hidden flex flex-col relative'
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      >
        {/* Header */}
        <div className='p-6 border-b border-gray-800 flex justify-between items-center bg-gradient-to-r from-gray-900 to-[#0d0d0d] relative overflow-hidden'>
          <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/10 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2"></div>
          
          <div className='flex items-center gap-4 relative z-10'>
            <div className="p-3 bg-yellow-500/20 rounded-xl border border-yellow-500/30 shadow-[0_0_15px_rgba(234,179,8,0.4)]">
              <Trophy className='w-8 h-8 text-yellow-500' />
            </div>
            <div>
              <h2 className='text-3xl font-bold text-white tracking-tight monster-title'>Rankeds</h2>
              <p className='text-yellow-500/80 text-sm font-medium'>Global Monster Dominance</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className='p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-full transition-colors relative z-10'
          >
            <X className='w-6 h-6' />
          </button>
        </div>

        {/* Content */}
        <div className='flex-1 overflow-y-auto p-2 md:p-6 custom-scrollbar relative'>
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64">
              <Loader />
              <p className="mt-4 text-gray-500 font-mono animate-pulse">Calculating Global Rankings...</p>
            </div>
          ) : error ? (
            <div className="text-center text-red-500 p-8 bg-red-500/10 rounded-2xl border border-red-500/20">
              <p className="font-bold mb-2">Error Connection</p>
              <p>{error}</p>
            </div>
          ) : leaderboardData.length === 0 ? (
            <div className="text-center text-gray-400 p-12">
              <Trophy className="w-16 h-16 mx-auto mb-4 opacity-20" />
              <p className="text-xl">The ladder is empty.</p>
              <p className="text-sm mt-2 opacity-50">Log your first monster to claim the crown.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Podium Top 3 View */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {leaderboardData.slice(0, 3).map((user, index) => {
                  const rank = index + 1;
                  const isFirst = rank === 1;
                  
                  return (
                    <motion.div 
                      key={user.username}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.15 }}
                      className={`relative flex flex-col items-center p-6 rounded-2xl border backdrop-blur-lg overflow-hidden ${
                        isFirst 
                          ? 'md:-mt-4 bg-gradient-to-b from-yellow-500/10 to-black border-yellow-500/50 shadow-[0_0_30px_rgba(234,179,8,0.2)]' 
                          : rank === 2
                            ? 'bg-gradient-to-b from-gray-300/10 to-black border-gray-400/30'
                            : 'bg-gradient-to-b from-amber-700/10 to-black border-amber-700/30'
                      }`}
                    >
                      {isFirst && <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-yellow-300 via-yellow-500 to-yellow-300"></div>}
                      
                      <RankBadge rank={rank} />
                      
                      <h3 className={`mt-4 text-xl font-bold truncate w-full text-center ${isFirst ? 'text-white text-2xl drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]' : 'text-gray-200'}`}>
                        {user.username}
                      </h3>
                      
                      <div className="mt-4 text-center">
                        <div className={`text-4xl font-black tracking-tighter ${isFirst ? 'text-yellow-400' : 'text-white'}`}>
                          {user.totalDrinksCount}
                        </div>
                        <p className="text-xs uppercase tracking-widest text-gray-500 mt-1">Cans Crushed</p>
                      </div>

                      <div className="w-full mt-6 space-y-2">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-400 flex items-center gap-1"><Coins className="w-4 h-4" /> Spent</span>
                          <span className="font-mono text-gray-200">{user.totalSpent.toFixed(2)}€</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-400 flex items-center gap-1"><Flame className="w-4 h-4 text-orange-500" /> Voltage</span>
                          <span className="font-mono text-gray-200">{user.totalCaffeine}mg</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-400 flex items-center gap-1"><CheckCircle2 className="w-4 h-4 text-green-500" /> Top</span>
                          <span className="font-mono text-gray-200 truncate max-w-[120px]" title={getDrinkName(user.favoriteDrinkId)}>{getShortName(getDrinkName(user.favoriteDrinkId))}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm mt-3 pt-3 border-t border-gray-800/50">
                          <span className="text-gray-400 flex items-center gap-1"><Zap className="w-4 h-4 text-purple-500" /> Max Streak</span>
                          <span className="font-mono text-gray-200">{user.maxStreak || 0} Days</span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* The Rest of the Ladder */}
              {leaderboardData.length > 3 && (
                <div className="bg-gray-900/50 rounded-2xl border border-gray-800 overflow-hidden">
                  <div className="grid grid-cols-5 md:grid-cols-6 gap-4 p-4 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-800">
                    <div className="col-span-2">Dominator</div>
                    <div className="text-right">Score (Cans)</div>
                    <div className="text-right hidden md:block">Voltage</div>
                    <div className="text-right">Spent</div>
                    <div className="text-right">Max Streak</div>
                  </div>
                  
                  <div className="divide-y divide-gray-800/50">
                    {leaderboardData.slice(3).map((user, idx) => (
                      <div 
                        key={user.username}
                        className="grid grid-cols-5 md:grid-cols-6 gap-4 p-4 items-center hover:bg-gray-800/30 transition-colors animate-fade-in-up"
                        style={{ animationDelay: `${0.4 + (idx * 0.05)}s` }}
                      >
                        <div className="col-span-2 flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gray-800 border border-gray-700 font-mono text-xs flex items-center justify-center text-gray-400 font-bold">
                            #{idx + 4}
                          </div>
                          <span className="font-semibold text-gray-200 truncate">{user.username}</span>
                        </div>
                        <div className="text-right font-black text-white text-lg">{user.totalDrinksCount}</div>
                        <div className="text-right font-mono text-gray-400 hidden md:block">{user.totalCaffeine}mg</div>
                        <div className="text-right font-mono text-gray-400">{user.totalSpent.toFixed(2)}€</div>
                        <div className="text-right font-mono text-purple-400 flex items-center gap-1 justify-end"><Zap className="w-3 h-3" /> {user.maxStreak || 0}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
