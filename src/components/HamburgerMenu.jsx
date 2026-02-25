import React from 'react';
import { X, Wine, Settings as SettingsIcon, LogOut } from 'lucide-react';

export default function HamburgerMenu({ open, onClose, onSelect }) {
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
              onSelect('partyMeter');
              onClose();
            }}
            className='flex items-center gap-3 px-4 py-4 rounded-xl bg-gray-800/40 hover:bg-gray-800 text-white font-semibold transition-all border border-gray-700/50'
          >
            <Wine className='w-5 h-5 text-pink-400' />
            Party Meter
          </button>

          <div className='h-px bg-gray-800 my-2'></div>

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
        </div>
        
        <div className='mt-auto text-center'>
          <p className='text-xs text-gray-600 font-mono tracking-tighter'>MONSTER TRACKER v2.0</p>
        </div>
      </div>
    </div>
  );
}
