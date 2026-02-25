import React, { useState, useEffect } from 'react';
import { Sparkles, TrendingUp, AlertTriangle } from 'lucide-react';

const AIInsightsMenu = ({ onSelect }) => {
  const [expanded, setExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 640);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 640);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Cierra el menú si cambia a desktop
  useEffect(() => {
    if (!isMobile) setExpanded(false);
  }, [isMobile]);

  // Cuando el botón principal se clickea, alterna el menú y el estado expandido
  const handleMainClick = () => {
    setExpanded((prev) => !prev);
    onSelect('menu');
  };

  // Siempre mostrar el botón flotante, pero el menú de opciones solo si corresponde
  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3">
      <button
        className={`ai-floating-btn ${expanded ? 'expanded' : 'collapsed'}`}
        onClick={handleMainClick}
        aria-label="Abrir menú IA"
        style={{ display: 'flex' }}
      >
        <span className="ai-icon">
          <Sparkles className="w-6 h-6 animate-pulse-green" />
        </span>
        <span className="ai-label">IA Tools</span>
      </button>
      {/* Desktop: menú siempre visible. Mobile: menú solo si expanded */}
      {((!isMobile) || (isMobile && expanded)) && (
        <div className="bg-gray-900/95 border border-green-500/30 rounded-xl shadow-xl p-4 flex flex-col gap-3 w-56 sm:w-64 animate-float mt-2">
          <button
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-green-500/10 transition monster-subtitle text-white w-full text-left"
            onClick={() => { setExpanded(false); onSelect('streak'); }}
          >
            <TrendingUp className="w-5 h-5 text-purple-400" />
            Predicción de Streak
          </button>
          <button
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-green-500/10 transition monster-subtitle text-white w-full text-left"
            onClick={() => { setExpanded(false); onSelect('anomaly'); }}
          >
            <AlertTriangle className="w-5 h-5 text-yellow-400" />
            Detección de Anomalías
          </button>
        </div>
      )}
    </div>
  );
};

export default AIInsightsMenu;
