import React, { useEffect, useState } from 'react';
import { ShieldAlert, AlertTriangle } from 'lucide-react';

function BannedScreenModal({ type, message, banUntil = null, onClose }) {
  // type can be 'temp' (Spam) or 'perma' (Ban Evasion)
  
  const [timeLeft, setTimeLeft] = useState(null);

  // Auto-redirect after 5 seconds if it's the instant kick
  useEffect(() => {
    if (type === 'kick') {
      const timer = setTimeout(() => {
        onClose();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [type, onClose]);

  // Live Countdown logic
  useEffect(() => {
    if (!banUntil) return;
    
    const calculateTimeLeft = () => {
      const diff = new Date(banUntil) - new Date();
      if (diff <= 0) return "Terminado";
      
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diff % (1000 * 60)) / 1000);
      return `${hours}h ${mins}m ${secs}s`;
    };

    // Calculate immediately
    setTimeLeft(calculateTimeLeft());
    
    // Ticking interval
    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(interval);
  }, [banUntil]);

  return (
    <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-black p-4 animate-fade-in">
      <div className="bg-red-950/40 border-2 border-red-600/50 rounded-3xl p-8 max-w-lg w-full text-center shadow-[0_0_50px_rgba(220,38,38,0.3)] relative overflow-hidden">
        
        {/* Background glow pulse */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-red-600/10 blur-[100px] rounded-full pointer-events-none animate-pulse"></div>

        <div className="mx-auto bg-red-900/40 w-24 h-24 rounded-full flex items-center justify-center mb-6 border border-red-500/50 relative z-10">
           {type === 'kick' ? <AlertTriangle className="w-12 h-12 text-red-500" /> : <ShieldAlert className="w-12 h-12 text-red-500" />}
        </div>
        
        <h1 className="text-3xl md:text-4xl font-black text-white mb-4 uppercase tracking-wider relative z-10">
          {type === 'kick' ? "Venga pa'l lobby" : "Acceso Denegado"}
        </h1>
        
        <p className="text-red-200 text-lg md:text-xl mb-8 font-medium relative z-10">
          {message}
        </p>

        {timeLeft && (
          <div className="bg-black/50 rounded-xl p-4 mb-8 border border-red-900/50 relative z-10">
            <p className="text-gray-400 text-sm font-bold uppercase tracking-widest mb-1">Tiempo Restante</p>
            <p className="text-3xl font-mono font-bold text-red-400 animate-pulse">{timeLeft}</p>
          </div>
        )}
        
        {type !== 'kick' && (
          <button 
            onClick={onClose}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-6 rounded-xl transition-colors relative z-10 uppercase tracking-wide"
          >
            Volver al Inicio
          </button>
        )}

      </div>
    </div>
  );
}

export default BannedScreenModal;
