import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft, Download } from 'lucide-react';

const steps = [
  {
    image: '/tutorial-images/tut-1.webp',
    title: 'Abre el menú del navegador',
    description: 'Toca el icono de los tres puntos (⋮) en la esquina derecha de tu navegador Chrome o Safari.',
  },
  {
    image: '/tutorial-images/tut-2.webp',
    title: 'Añadir a Pantalla de Inicio',
    description: 'Busca y selecciona la opción "Añadir a la pantalla de inicio" (o "Instalar aplicación") en el menú desplegable.',
  },
  {
    image: '/tutorial-images/tut-3.webp',
    title: 'Confirma la Instalación',
    description: 'Haz clic en "Añadir" o "Instalar". Esto creará un icono de acceso directo en la pantalla de tu móvil.',
  },
  {
    image: '/tutorial-images/tut-4.webp',
    title: '¡Usa los Atajos Rápidos!',
    description: 'Mantén pulsado el icono de la app para acceder para añadir tus latas. (Solo funciona en Android, en iOS no está disponible).',
  }
];

const PWAInstallGuideModal = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      // Reset to first step when modal closes
      setTimeout(() => setCurrentStep(0), 200);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(curr => curr + 1);
    } else {
      onClose();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(curr => curr - 1);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="bg-gray-900 border border-green-500/30 rounded-2xl w-full max-w-sm overflow-hidden flex flex-col mx-auto"
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-800">
            <div className="flex items-center gap-2 text-green-400">
              <Download size={20} />
              <h2 className="font-bold text-lg font-['Orbitron',sans-serif]">Instalar Web App</h2>
            </div>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {/* Dynamic Content Body */}
          <div className="relative w-full h-[450px] sm:h-[500px] bg-black flex flex-col">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                className="absolute inset-0 flex flex-col items-center justify-between"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                {/* Image Section */}
                <div className="flex-1 w-full flex items-center justify-center p-4 min-h-0">
                  <img
                    src={steps[currentStep].image}
                    alt={`Tutorial paso ${currentStep + 1}`}
                    className="max-w-full max-h-full object-contain rounded-lg shadow-[0_0_20px_rgba(34,197,94,0.15)]"
                  />
                </div>

                {/* Text Description Box */}
                <div className="w-full shrink-0 bg-gradient-to-t from-gray-900 via-gray-900 to-transparent pt-8 pb-4 px-6 text-center z-10">
                  <h3 className="text-green-400 font-bold text-xl mb-2 font-['Orbitron',sans-serif]">
                    {steps[currentStep].title}
                  </h3>
                  <p className="text-gray-300 text-sm leading-relaxed max-w-xs mx-auto">
                    {steps[currentStep].description}
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation Footer */}
          <div className="p-4 border-t border-gray-800 flex items-center justify-between">
            <button
              onClick={prevStep}
              className={`p-2 rounded-full transition-colors ${currentStep === 0 ? 'text-gray-600 cursor-not-allowed' : 'text-green-400 hover:bg-green-400/10'}`}
              disabled={currentStep === 0}
            >
              <ChevronLeft size={28} />
            </button>
            
            {/* Dot Indicators */}
            <div className="flex gap-2">
              {steps.map((_, idx) => (
                <div 
                  key={idx} 
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${idx === currentStep ? 'bg-green-500 w-4' : 'bg-gray-600'}`}
                />
              ))}
            </div>

            <button
              onClick={nextStep}
              className="p-2 rounded-full text-green-400 hover:bg-green-400/10 transition-colors"
            >
              {currentStep === steps.length - 1 ? (
                <span className="font-bold px-2 py-1 text-sm">Entendido</span>
              ) : (
                <ChevronRight size={28} />
              )}
            </button>
          </div>

        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PWAInstallGuideModal;
