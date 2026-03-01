import React, { useState, useEffect } from 'react';
import { X, Wine, Settings as SettingsIcon, LogOut, Flame, Trophy } from 'lucide-react';

export default function HamburgerMenu({ open, onClose, onSelect, isWrappedActive }) {
  const [countdown, setCountdown] = useState('');

  useEffect(() => {
    if (isWrappedActive) {
      setCountdown('');
      return;
    }

    const calculateTimeLeft = () => {
      const now = new Date();
      // Calculate end of the current month
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      endOfMonth.setHours(23, 59, 59, 999);
      
      // Target date is end of month minus 2 days
      const targetDate = new Date(endOfMonth);
      targetDate.setDate(endOfMonth.getDate() - 2);
      targetDate.setHours(0, 0, 0, 0);

      // If we are past the target date for some reason but not active, 
      // maybe look at next month (edge case fallback)
      if (now > targetDate) {
         targetDate.setMonth(targetDate.getMonth() + 1);
         const nextEndOfMonth = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0);
         targetDate.setDate(nextEndOfMonth.getDate() - 2);
      }

      const diff = targetDate.getTime() - now.getTime();
      
      if (diff <= 0) {
        setCountdown('Unlocks soon');
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      
      setCountdown(`${days}d ${hours}h`);
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 60000); // Update every minute
    return () => clearInterval(timer);
  }, [isWrappedActive]);

  if (!open) return null;
  return (
    <div className='fixed inset-0 z-[100] flex justify-end'>
      {/* Background overlay */}
      <div 
        className='absolute inset-0 bg-black/80 backdrop-blur-sm' 
        onClick={onClose}
      ></div>
      
      {/* Vertical Sidebar */}
      <div className='relative bg-[#0d0d0d] shadow-2xl w-[280px] h-full p-6 border-l border-green-500/20 animate-slideInRight flex flex-col'>
        <div className='flex items-center justify-between mb-8'>
          <h2 className='text-xl font-bold text-white monster-title'>Menu</h2>
          <button 
            className='text-gray-400 hover:text-white p-2' 
            onClick={onClose}
          >
            <X className='w-6 h-6' />
          </button>
        </div>

        <div className='flex flex-col gap-3 overflow-y-auto pb-6'>
          {/* CORE FEATURES */}
          <button
            onClick={() => {
              onSelect('leaderboard');
              onClose();
            }}
            className='flex items-center gap-3 px-4 py-4 rounded-xl bg-gray-800/40 hover:bg-gray-800 text-white font-semibold transition-all border border-gray-700/50'
          >
            <Trophy className='w-5 h-5 text-yellow-500' />
            Rankeds
          </button>

          <button
            onClick={() => {
              if (isWrappedActive) {
                 onSelect('wrapped');
                 onClose();
              }
            }}
            className={`flex items-center justify-between px-4 py-4 rounded-xl transition-all border ${
              isWrappedActive 
                ? 'bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 border-yellow-500/50 shadow-[0_0_15px_rgba(234,179,8,0.3)] animate-slow-pulse'
                : 'bg-gray-800/20 text-gray-500 border-gray-700/20 cursor-not-allowed'
            }`}
          >
            <div className='flex items-center gap-3 font-bold'>
              <Flame className={`w-5 h-5 ${isWrappedActive ? 'text-yellow-400' : 'text-gray-600'}`} />
              Monster Wrapped
            </div>
            {!isWrappedActive && (
              <span className='text-xs font-mono bg-gray-800 px-2 py-1 rounded text-gray-400'>
                {countdown}
              </span>
            )}
          </button>

          <button
            onClick={() => {
              onSelect('partyMeter');
              onClose();
            }}
            className='flex items-center gap-3 px-4 py-4 rounded-xl bg-gray-800/40 hover:bg-gray-800 text-white font-semibold transition-all border border-gray-700/50'
          >
            <Wine className='w-5 h-5 text-pink-400' />
            Party Meter
          </button>

        </div>
        
        <div className='mt-auto flex flex-col gap-3 pt-6'>
          {/* DIVIDER */}
          <div className='h-px bg-gray-800/80 mb-1 w-full'></div>

          {/* SETTINGS & AUTH */}
          <button
            onClick={() => {
              onSelect('settings');
              onClose();
            }}
            className='flex items-center gap-3 px-4 py-4 rounded-xl bg-gray-800/40 hover:bg-gray-800 text-white font-semibold transition-all border border-gray-700/50'
          >
            <SettingsIcon className='w-5 h-5 text-green-400' />
            Settings
          </button>

          <button
            onClick={() => {
              onSelect('logout');
              onClose();
            }}
            className='flex items-center gap-3 px-4 py-4 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-500 font-bold transition-all border border-red-500/20'
          >
            <LogOut className='w-5 h-5' />
            Log Out
          </button>

          <div className='text-center mt-4'>
            <p className='text-xs text-gray-600 font-mono tracking-tighter'>MONSTER TRACKER v2.1</p>
          </div>
        </div>
      </div>
    </div>
  );
}
