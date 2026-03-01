import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trophy, Sparkles, Wrench } from 'lucide-react';

export default function UpdateModal({ isOpen, onClose }) {
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, 35000); // Auto-close after 35 seconds
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-pointer"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md bg-gray-900 border border-green-500/30 rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-green-600/20 to-green-500/10 p-6 border-b border-green-500/20">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <Sparkles className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white leading-tight">Monster Tracker</h2>
                  <p className="text-green-400 font-mono text-sm">v2.1 Update</p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* New Features */}
              <div>
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-yellow-500" /> Nuevas Funciones
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3 text-gray-300 text-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 shrink-0" />
                    <p>
                      <strong className="text-white">Rankeds Globales:</strong> ¡Compite con otros usuarios! Descubre quién tiene el Voltaje (Cafeína) más alto, rachas más largas y mayores gastos.
                    </p>
                  </li>
                  <li className="flex items-start gap-3 text-gray-300 text-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 mt-1.5 shrink-0" />
                    <p>
                      <strong className="text-white">Estatus de Élite (Top 3):</strong> Los líderes del podio reciben medallas exclusivas. ¡El #1 absoluto desbloquea un aura dorada en toda su app!
                    </p>
                  </li>
                  <li className="flex items-start gap-3 text-gray-300 text-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5 shrink-0" />
                    <p>
                      <strong className="text-white">Monster Wrapped:</strong> Revive y comparte tus estadísticas de consumo al comienzo de cada mes con historias interactivas.
                    </p>
                  </li>
                </ul>
              </div>

              {/* Bug Fixes */}
              <div>
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-blue-500" /> Correcciones
                </h3>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-gray-400 text-sm">
                    <div className="w-1 h-1 rounded-full bg-gray-500" />
                    Solucionado el error 'Method Not Allowed' que bloqueaba el inicio de sesión y registro.
                  </li>
                  <li className="flex items-center gap-2 text-gray-400 text-sm">
                    <div className="w-1 h-1 rounded-full bg-gray-500" />
                    Optimización general de las rutas de la API del Backend.
                  </li>
                </ul>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-gray-950/50 border-t border-gray-800 text-center">
              <button
                onClick={onClose}
                className="w-full py-2.5 bg-green-500/20 hover:bg-green-500/30 text-green-400 font-semibold rounded-lg transition-colors"
              >
                ¡Entendido!
              </button>
            </div>
            
            {/* Auto-Close Progress Bar */}
            <motion.div 
              className="absolute bottom-0 left-0 h-1 bg-green-500"
              initial={{ width: "100%" }}
              animate={{ width: "0%" }}
              transition={{ duration: 35, ease: "linear" }}
            />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
