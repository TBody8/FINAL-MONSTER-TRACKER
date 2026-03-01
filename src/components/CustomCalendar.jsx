import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';

const CustomCalendar = ({ selectedDate, onSelectDate, onClose }) => {
  // Parse incoming date or default to today
  const initialDate = selectedDate ? new Date(selectedDate) : new Date();
  
  const [currentMonth, setCurrentMonth] = useState(initialDate.getMonth());
  const [currentYear, setCurrentYear] = useState(initialDate.getFullYear());

  const today = new Date();
  const todayString = today.toISOString().split('T')[0];

  const daysInMonth = (month, year) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (month, year) => new Date(year, month, 1).getDay();

  const handlePrevMonth = (e) => {
    e.stopPropagation();
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = (e) => {
    e.stopPropagation();
    // Prevent going to future months if we are in the current month/year
    if (currentYear === today.getFullYear() && currentMonth === today.getMonth()) {
      return;
    }

    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const handleDateClick = (e, day) => {
    e.stopPropagation();
    const clickedDate = new Date(currentYear, currentMonth, day);
    // Adjust for timezone offset to get local string
    const offset = clickedDate.getTimezoneOffset()
    clickedDate.setMinutes(clickedDate.getMinutes() - offset)
    const dateStr = clickedDate.toISOString().split('T')[0];

    if (dateStr <= todayString) {
      onSelectDate(dateStr);
      if (onClose) onClose();
    }
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  const days = useMemo(() => {
    const totalDays = daysInMonth(currentMonth, currentYear);
    const startDay = firstDayOfMonth(currentMonth, currentYear);
    
    // Create padding for days before the 1st
    const padding = Array.from({ length: startDay }, (_, i) => null);
    // Create actual days
    const monthDays = Array.from({ length: totalDays }, (_, i) => i + 1);
    
    return [...padding, ...monthDays];
  }, [currentMonth, currentYear]);

  // Check if next button should be disabled
  const isNextDisabled = currentYear === today.getFullYear() && currentMonth === today.getMonth();

  return (
    <motion.div 
      className="absolute inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 left-0 top-0"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={(e) => {
        e.stopPropagation();
        if (onClose) onClose();
      }}
    >
      {/* Calendar Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: -10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -10 }}
        transition={{ duration: 0.2 }}
        className="bg-gray-800 border border-green-500/30 rounded-xl shadow-2xl overflow-hidden w-72 max-w-full"
        onClick={(e) => e.stopPropagation()}
      >
      <div className="bg-gray-900 px-4 py-3 flex items-center justify-between border-b border-green-500/20">
        <button 
          onClick={handlePrevMonth}
          className="p-1 rounded hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="text-white font-bold text-sm tracking-wide">
          {monthNames[currentMonth]} {currentYear}
        </span>
        <button 
          onClick={handleNextMonth}
          disabled={isNextDisabled}
          className={`p-1 rounded transition-colors ${
            isNextDisabled 
              ? 'text-gray-600 cursor-not-allowed' 
              : 'hover:bg-gray-700 text-gray-400 hover:text-white'
          }`}
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      <div className="p-4">
        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekDays.map(day => (
            <div key={day} className="text-center text-xs text-gray-500 font-semibold py-1">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {days.map((day, index) => {
            if (day === null) {
              return <div key={`empty-${index}`} className="h-8 w-8" />;
            }

            const currentCellDate = new Date(currentYear, currentMonth, day);
            const offset = currentCellDate.getTimezoneOffset()
            currentCellDate.setMinutes(currentCellDate.getMinutes() - offset)
            const dateStr = currentCellDate.toISOString().split('T')[0];

            const isToday = dateStr === todayString;
            const isSelected = dateStr === selectedDate;
            const isFuture = dateStr > todayString;

            let buttonClass = "h-8 w-8 rounded-full flex items-center justify-center text-sm transition-all duration-200 ";
            
            if (isFuture) {
              buttonClass += "text-gray-600 cursor-not-allowed";
            } else if (isSelected) {
              buttonClass += "bg-green-500 text-black font-bold shadow-[0_0_10px_rgba(0,255,65,0.5)]";
            } else if (isToday) {
              buttonClass += "text-green-400 font-bold border border-green-500/50 hover:bg-gray-700";
            } else {
              buttonClass += "text-gray-300 hover:bg-gray-700 hover:text-white";
            }

            return (
              <button
                key={dateStr}
                disabled={isFuture}
                onClick={(e) => handleDateClick(e, day)}
                className={buttonClass}
              >
                {day}
              </button>
            );
          })}
        </div>
      </div>
      
      <div className="bg-gray-900 border-t border-green-500/20 px-4 py-2 flex justify-between items-center">
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <CalendarIcon className="w-3 h-3" />
          <span>No future dating</span>
        </div>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onSelectDate(todayString);
            if(onClose) onClose();
          }} 
          className="text-xs text-green-400 hover:text-green-300 transition-colors font-semibold"
        >
          Go to Today
        </button>
      </div>
      </motion.div>
    </motion.div>
  );
};

export default CustomCalendar;
