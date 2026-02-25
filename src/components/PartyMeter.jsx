import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Wine } from 'lucide-react';

const DRINKS = [
  { name: 'Cubata', defaultPercent: 10, defaultSize: 500, emoji: '🥃' },
  { name: 'Cerveza', defaultPercent: 5, defaultSize: 330, emoji: '🍺' },
  { name: 'Vino', defaultPercent: 12, defaultSize: 500, emoji: '🍷' },
  { name: 'Whisky', defaultPercent: 40, defaultSize: 10, emoji: '🥃' },
  { name: 'Vodka', defaultPercent: 40, defaultSize: 10, emoji: '🍸' },
  { name: 'Ron', defaultPercent: 40, defaultSize: 10, emoji: '🥃' },
];

const LEVELS = [
  { label: 'Poco', value: 0.06, color: 'bg-green-400', emoji: '🙂' },
  { label: 'Medio', value: 0.11, color: 'bg-yellow-400', emoji: '😅' },
  { label: 'Extremo', value: 0.16, color: 'bg-red-500', emoji: '🥴' },
];

// Corrige la fórmula para usar el método Widmark estándar y BAC en g/dL
function calculateCups({ C, H, m, r, V, percent }) {
  // C: nivel BAC objetivo (por ejemplo, 0.06)
  // H: horas
  // m: peso en kg
  // r: coeficiente de sexo
  // V: volumen de copa en ml
  // percent: graduación alcohólica (% vol)

  // 1. Calcular gramos de alcohol necesarios para alcanzar el BAC objetivo
  // BAC_objetivo = (A / (r * m)) * 100 - 0.015 * H
  // => A = ((BAC_objetivo + 0.015 * H) * (r * m)) / 0.1
  const gramosNecesarios = ((C + 0.015 * H) * (r * m)) / 0.1;
  // 2. Calcular gramos de alcohol por copa
  const gramosPorCopa = V * (percent / 100) * 0.789;
  if (gramosPorCopa === 0) return 0;
  // 3. Número de copas
  return gramosNecesarios / gramosPorCopa;
}

export default function PartyMeter({ userSex, userWeight, onSaveProfile }) {
  const [drink, setDrink] = useState(DRINKS[0]);
  const [percent, setPercent] = useState(DRINKS[0].defaultPercent);
  const [cupSize, setCupSize] = useState(DRINKS[0].defaultSize);
  const [hours, setHours] = useState(1);
  const [level, setLevel] = useState(LEVELS[1]);
  const [sex, setSex] = useState(userSex || 'male');
  const [weight, setWeight] = useState(userWeight || '');
  const [showProfile, setShowProfile] = useState(!userSex || !userWeight);
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (!showProfile && weight && sex) {
      const r = sex === 'male' ? 0.68 : 0.55;
      const N = calculateCups({
        C: level.value,
        H: hours,
        m: parseFloat(weight),
        r,
        V: parseFloat(cupSize),
        percent: parseFloat(percent),
      });
      setResult(N);
    }
  }, [drink, percent, cupSize, hours, level, sex, weight, showProfile]);

  const handleProfileSave = () => {
    if (weight && sex) {
      onSaveProfile && onSaveProfile({ sex, weight });
      setShowProfile(false);
    }
  };

  return (
    <motion.div
      className='w-full max-w-md mx-auto rounded-2xl p-6 bg-gradient-to-br from-pink-900 via-purple-900 to-blue-900 shadow-2xl border-2 border-pink-400/30 relative overflow-hidden'
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: 'easeOut' }}
    >
      <motion.div className='flex items-center justify-center gap-2 mb-4'>
        <Wine className='w-8 h-8 text-pink-300 animate-bounce' />
        <span className='text-2xl font-bold text-pink-200 tracking-wider drop-shadow'>
          Medidor de Borrachera
        </span>
      </motion.div>
      <div className='flex flex-col gap-4'>
        {showProfile ? (
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className='bg-pink-800/30 p-4 rounded-xl flex flex-col gap-3'
          >
            <div className='flex gap-2 items-center'>
              <span className='text-pink-200 font-semibold'>Sexo:</span>
              <select
                value={sex}
                onChange={(e) => setSex(e.target.value)}
                className='rounded px-2 py-1 bg-pink-900 text-white'
              >
                <option value='male'>Hombre</option>
                <option value='female'>Mujer</option>
              </select>
            </div>
            <div className='flex gap-2 items-center'>
              <span className='text-pink-200 font-semibold'>Peso (kg):</span>
              <input
                type='number'
                min='30'
                max='200'
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className='rounded px-2 py-1 bg-pink-900 text-white w-20'
              />
            </div>
            <button
              onClick={handleProfileSave}
              className='mt-2 bg-pink-500 hover:bg-pink-400 text-white font-bold py-2 rounded transition-all'
            >
              Guardar
            </button>
          </motion.div>
        ) : (
          <>
            <div className='flex gap-2 items-center'>
              <span className='text-pink-200 font-semibold'>Bebida:</span>
              <select
                value={drink.name}
                onChange={(e) => {
                  const d = DRINKS.find((dr) => dr.name === e.target.value);
                  setDrink(d);
                  setPercent(d.defaultPercent);
                }}
                className='rounded px-2 py-1 bg-pink-900 text-white'
              >
                {DRINKS.map((d) => (
                  <option key={d.name} value={d.name}>
                    {d.emoji} {d.name}
                  </option>
                ))}
              </select>
              <span className='text-pink-200 font-semibold'>%:</span>
              <input
                type='number'
                min='1'
                max='80'
                value={percent}
                onChange={(e) => setPercent(e.target.value)}
                className='rounded px-2 py-1 bg-pink-900 text-white w-16'
              />
            </div>
            <div className='flex gap-2 items-center'>
              <span className='text-pink-200 font-semibold'>
                Tamaño copa (ml):
              </span>
              <input
                type='number'
                min='20'
                max='1000'
                value={cupSize}
                onChange={(e) => setCupSize(e.target.value)}
                className='rounded px-2 py-1 bg-pink-900 text-white w-20'
              />
            </div>
            <div className='flex gap-2 items-center'>
              <span className='text-pink-200 font-semibold'>Tiempo (h):</span>
              <input
                type='number'
                min='1'
                max='12'
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                className='rounded px-2 py-1 bg-pink-900 text-white w-16'
              />
            </div>
            <div className='flex gap-2 items-center'>
              <span className='text-pink-200 font-semibold'>Nivel:</span>
              {LEVELS.map((l) => (
                <button
                  key={l.label}
                  onClick={() => setLevel(l)}
                  className={`px-3 py-1 rounded-full font-bold text-white ${
                    l.color
                  } ${
                    level.label === l.label
                      ? 'ring-2 ring-pink-300 scale-110'
                      : 'opacity-70'
                  } transition-all`}
                >
                  {l.emoji} {l.label}
                </button>
              ))}
            </div>
            <motion.div className='mt-6 flex flex-col items-center justify-center'>
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200 }}
                className='text-5xl font-extrabold text-pink-300 drop-shadow-lg animate-pulse'
              >
                {result !== null && !isNaN(result) ? result.toFixed(1) : '--'}
              </motion.div>
              <div className='text-pink-100 font-semibold mt-1'>
                copas para lograr el nivel{' '}
                <span className='uppercase'>{level.label}</span>
              </div>
            </motion.div>
          </>
        )}
      </div>
      {/* Animación de fondo de fiesta */}
      <motion.div
        className='absolute inset-0 pointer-events-none z-0'
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.18 }}
        style={{
          background:
            'repeating-linear-gradient(135deg, #ff7ce5 0 2px, transparent 2px 20px), repeating-linear-gradient(225deg, #7f9cf5 0 2px, transparent 2px 20px)',
        }}
      />
      {/* Confeti animado */}
      <motion.div
        className='absolute left-0 right-0 top-0 flex justify-center z-10'
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.7, type: 'spring' }}
      ></motion.div>
    </motion.div>
  );
}
