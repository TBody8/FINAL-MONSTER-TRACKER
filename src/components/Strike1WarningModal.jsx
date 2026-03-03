import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

function Strike1WarningModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const handleClose = () => {
    localStorage.setItem('strike1_dismiss_time', Date.now().toString());
    localStorage.setItem('post_strike_clicks', '0');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4">
      <div className="bg-gray-900 border border-yellow-500/50 rounded-2xl p-6 md:p-8 max-w-sm w-full text-center shadow-[0_0_30px_rgba(234,179,8,0.2)] animate-fade-in-up relative">
        <button 
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
        
        <div className="w-20 h-20 mx-auto bg-yellow-500/10 rounded-full flex items-center justify-center mb-6 border border-yellow-500/30">
          <AlertTriangle className="w-10 h-10 text-yellow-500" />
        </div>
        
        <h2 className="text-2xl font-bold text-white mb-2">A DONDE VAS LOKO 🛑</h2>
        <p className="text-gray-300 text-lg mb-6 leading-relaxed">
          Bro, llevas <span className="text-yellow-400 font-bold">4 latas</span> hoy. Relaja un poco, no?.
        </p>
        
        <button 
          onClick={handleClose}
          className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 px-4 rounded-xl transition-colors"
        >
          Entendido
        </button>
      </div>
    </div>
  );
}

export default Strike1WarningModal;
