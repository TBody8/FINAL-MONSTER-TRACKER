import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

export default function KingsAura() {
  const particleCount = 20;
  
  const particles = useMemo(() => {
    return Array.from({ length: particleCount }).map((_, i) => ({
      id: i,
      size: Math.random() * 4 + 2, // 2px to 6px
      left: `${Math.random() * 100}%`,
      duration: `${Math.random() * 10 + 10}s`, // 10s to 20s
      delay: `${Math.random() * 10}s`,
      drift: `${Math.random() * 40 - 20}px` // Swaying slowly in X
    }));
  }, [particleCount]);

  return (
    <div className='fixed inset-0 pointer-events-none z-0 overflow-hidden'>
      <style>
        {particles.map(p => `
          @keyframes goldFloat-${p.id} {
            0% {
              transform: translateY(0px) translateX(0px);
              opacity: 0;
            }
            15% {
              opacity: 0.8;
            }
            85% {
              opacity: 0.8;
            }
            100% {
              transform: translateY(-110vh) translateX(${p.drift});
              opacity: 0;
            }
          }
          .gold-particle-${p.id} {
            position: absolute;
            bottom: -20px;
            border-radius: 50%;
            background-color: #facc15;
            box-shadow: 0 0 10px rgba(250, 204, 21, 0.8);
            animation: goldFloat-${p.id} ${p.duration} linear infinite;
            animation-delay: ${p.delay};
            will-change: transform, opacity;
          }
        `).join('')}
      </style>

      {/* Resplandor Atmosférico Base */}
      <motion.div 
        className='absolute inset-0 bg-gradient-to-t from-yellow-500/10 via-yellow-500/5 to-transparent'
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2 }}
      />
      
      {/* Soft Golden Vignette Overlay */}
      <div 
        className="absolute inset-0 pointer-events-none" 
        style={{ boxShadow: 'inset 0 0 150px rgba(234, 179, 8, 0.15)' }} 
      />
      
      {/* Partículas Flotantes de Oro */}
      {particles.map(p => (
        <div
          key={p.id}
          className={`gold-particle-${p.id}`}
          style={{
            width: p.size,
            height: p.size,
            left: p.left,
          }}
        />
      ))}

      {/* Halo Mágico en los Bordes Superiores */}
      <motion.div 
        className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-2xl h-32 bg-yellow-500/20 blur-[100px]"
        animate={{
          opacity: [0.5, 0.8, 0.5]
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    </div>
  );
}
