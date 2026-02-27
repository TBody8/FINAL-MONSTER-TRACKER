import React, { useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, EffectCoverflow } from 'swiper/modules';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Zap, Flame, Sparkles, Euro } from 'lucide-react';
import * as mockData from '../data/mockData';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-coverflow';

const DrinkSelector = ({ onDrinkSelect, selectedDrinks = [], initialDrinkId = null, autoOpenModal = false, standalone = false }) => {
  const [selectedDrink, setSelectedDrink] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPriceModal, setShowPriceModal] = useState(false);
  const [currentDrink, setCurrentDrink] = useState(null);
  const [customPrice, setCustomPrice] = useState('');
  const [swiperInstance, setSwiperInstance] = useState(null);
  const [hasInitialized, setHasInitialized] = useState(false);

  React.useEffect(() => {
    if (initialDrinkId && swiperInstance && !hasInitialized) {
      const index = mockData.monsterDrinks.findIndex(d => 
        d.id === initialDrinkId || 
        d.name.toLowerCase().replace(/ /g, '-') === initialDrinkId || 
        d.name.toLowerCase().includes(initialDrinkId.replace(/-/g, ' '))
      );
      if (index !== -1) {
        swiperInstance.slideTo(index, 0); // 0ms transition for instant jump
        if (autoOpenModal) {
          setTimeout(() => {
            setCurrentDrink(mockData.monsterDrinks[index]);
            setCustomPrice(mockData.monsterDrinks[index].defaultPrice.toString());
            setShowPriceModal(true);
          }, 500);
        }
        setHasInitialized(true);
      }
    }
  }, [initialDrinkId, swiperInstance, autoOpenModal, hasInitialized]);

  const handleDrinkClick = async (drink) => {
    setCurrentDrink(drink);
    setCustomPrice(drink.defaultPrice.toString());
    setShowPriceModal(true);
  };

  const confirmDrinkSelection = async () => {
    if (!currentDrink || !customPrice) return;

    setSelectedDrink(currentDrink);
    setIsLoading(true);
    setShowPriceModal(false);

    // Add smooth animation delay
    await new Promise((resolve) => setTimeout(resolve, 600));

    const drinkWithPrice = {
      ...currentDrink,
      selectedPrice: customPrice === '' ? currentDrink.defaultPrice : parseFloat(customPrice),
    };

    onDrinkSelect(drinkWithPrice);

    // Reset states after animation
    setTimeout(() => {
      setSelectedDrink(null);
      setIsLoading(false);
      setCurrentDrink(null);
      setCustomPrice('');
    }, 300);
  };

  const cancelSelection = () => {
    setShowPriceModal(false);
    setCurrentDrink(null);
    setCustomPrice('');
  };

  return (
    <>
      <motion.div
        className={standalone ? '' : 'bg-gradient-to-br from-gray-900 via-black to-gray-900 rounded-2xl p-4 md:p-8 border border-green-500/20 hover:border-green-500/40 transition-all duration-500'}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        <div className='text-center mb-8'>
          <motion.h2
            className='text-4xl font-bold bg-gradient-to-r from-green-300 via-green-400 to-green-500 bg-clip-text text-transparent mb-4 monster-title'
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            Choose Your Monster
          </motion.h2>
          <motion.p
            className='text-gray-400 text-lg monster-subtitle'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            Select your energy weapon of choice
          </motion.p>
        </div>

        <Swiper
          onSwiper={setSwiperInstance}
          effect='coverflow'
          grabCursor={true}
          centeredSlides={true}
          slidesPerView='auto'
          coverflowEffect={{
            rotate: 50,
            stretch: 0,
            depth: 100,
            modifier: 1,
            slideShadows: true,
          }}
          pagination={{
            clickable: true,
            dynamicBullets: true,
          }}
          navigation={true}
          modules={[EffectCoverflow, Pagination, Navigation]}
          className='monster-swiper'
          speed={800}
        >
          {mockData.monsterDrinks.map((drink, index) => (
            <SwiperSlide key={drink.id} className='!w-[280px] md:!w-80'>
              <motion.div
                className={`relative group cursor-pointer transform transition-all duration-500 ${
                  selectedDrink?.id === drink.id ? 'scale-105' : ''
                }`}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: index * 0.1,
                  duration: 0.6,
                  ease: 'easeOut',
                }}
                whileHover={{
                  scale: 1.05,
                  rotateY: 10,
                  transition: { duration: 0.3 },
                }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleDrinkClick(drink)}
              >
                <div className='bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-4 md:p-6 border border-green-500/30 hover:border-green-500/60 transition-all duration-300 hover:shadow-2xl hover:shadow-green-500/20'>
                  <div className='relative overflow-hidden rounded-lg mb-4'>
                    <motion.img
                      src={drink.image}
                      alt={drink.name}
                      className='w-full h-64 object-cover transition-transform duration-500 group-hover:scale-110'
                      whileHover={{ scale: 1.1 }}
                    />
                    <div className='absolute inset-0 bg-gradient-to-t from-black/60 to-transparent' />
                    <div className='absolute top-3 right-3'>
                      <motion.div
                        className='bg-green-500 text-black px-3 py-1 rounded-full text-sm font-bold monster-subtitle'
                        initial={{ scale: 0, rotate: -10 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ delay: 0.2 + index * 0.1, duration: 0.4 }}
                        whileHover={{ scale: 1.1, rotate: 5 }}
                      >
                        {drink.category}
                      </motion.div>
                    </div>
                    <div className='absolute top-3 left-3'>
                      <motion.div
                        className='bg-yellow-500 text-black px-3 py-1 rounded-full text-sm font-bold monster-subtitle flex items-center gap-1'
                        initial={{ scale: 0, rotate: 10 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ delay: 0.3 + index * 0.1, duration: 0.4 }}
                      >
                        {drink.defaultPrice}
                        <Euro className='w-3 h-3 ml-0.5' />
                      </motion.div>
                    </div>
                    {selectedDrink?.id === drink.id && (
                      <motion.div
                        className='absolute inset-0 bg-green-500/30 rounded-lg flex items-center justify-center'
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            ease: 'linear',
                          }}
                        >
                          <Sparkles className='w-8 h-8 text-green-400' />
                        </motion.div>
                      </motion.div>
                    )}
                  </div>

                  <motion.h3
                    className='text-xl font-bold text-white mb-3 monster-subtitle'
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 + index * 0.1, duration: 0.5 }}
                  >
                    {drink.name}
                  </motion.h3>

                  <div className='grid grid-cols-2 gap-4 text-sm'>
                    <motion.div
                      className='flex items-center gap-2'
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + index * 0.1, duration: 0.4 }}
                    >
                      <Zap className='w-4 h-4 text-yellow-400' />
                      <span className='text-gray-300'>
                        {drink.caffeine}mg caffeine
                      </span>
                    </motion.div>
                    <motion.div
                      className='flex items-center gap-2'
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + index * 0.1, duration: 0.4 }}
                    >
                      <Flame className='w-4 h-4 text-red-400' />
                      <span className='text-gray-300'>
                        {drink.calories} cal
                      </span>
                    </motion.div>
                  </div>

                  <motion.div
                    className='mt-4 flex items-center justify-between'
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 + index * 0.1, duration: 0.4 }}
                  >
                    <span className='text-gray-400'>{drink.size}</span>
                    <motion.button
                      className='bg-green-500 hover:bg-green-600 text-black font-bold px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-300 monster-subtitle'
                      whileHover={{
                        scale: 1.05,
                        boxShadow: '0 0 20px rgba(0, 255, 65, 0.5)',
                      }}
                      whileTap={{ scale: 0.95 }}
                      disabled={isLoading && selectedDrink?.id === drink.id}
                    >
                      {isLoading && selectedDrink?.id === drink.id ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            ease: 'linear',
                          }}
                        >
                          <Sparkles className='w-4 h-4' />
                        </motion.div>
                      ) : (
                        <Plus className='w-4 h-4' />
                      )}
                      Add
                    </motion.button>
                  </motion.div>
                </div>

                {selectedDrink?.id === drink.id && (
                  <motion.div
                    className='absolute inset-0 bg-green-500/20 rounded-xl border-2 border-green-500 pointer-events-none'
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{
                      opacity: 1,
                      scale: 1,
                      boxShadow: [
                        '0 0 0 rgba(0, 255, 65, 0.5)',
                        '0 0 20px rgba(0, 255, 65, 0.8)',
                        '0 0 0 rgba(0, 255, 65, 0.5)',
                      ],
                    }}
                    transition={{
                      duration: 0.3,
                      boxShadow: { duration: 2, repeat: Infinity },
                    }}
                  />
                )}
              </motion.div>
            </SwiperSlide>
          ))}
        </Swiper>

        <AnimatePresence>
          {selectedDrinks.length > 0 && (
            <motion.div
              className='mt-8 p-4 bg-green-500/10 rounded-lg border border-green-500/30'
              initial={{ opacity: 0, height: 0, y: 20 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: -20 }}
              transition={{ duration: 0.4, ease: 'easeInOut' }}
            >
              <motion.p
                className='text-green-400 text-center monster-subtitle'
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                Today's Selection: {selectedDrinks.length} drink
                {selectedDrinks.length !== 1 ? 's' : ''} added! ⚡
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Price Selection Modal */}
      <AnimatePresence>
        {showPriceModal && currentDrink && (
          <motion.div
            className='fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className='bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 max-w-md w-full border border-green-500/20'
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className='text-center mb-6'>
                <img
                  src={currentDrink.image}
                  alt={currentDrink.name}
                  className='w-24 h-24 object-cover rounded-lg mx-auto mb-4'
                />
                <h3 className='text-2xl font-bold text-white monster-subtitle mb-2'>
                  {currentDrink.name}
                </h3>
                <p className='text-gray-400'>Set the price for this Monster</p>
              </div>

              <div className='space-y-4'>
                <div>
                  <label className='block text-white font-semibold mb-2 monster-subtitle'>
                    Price (€)
                  </label>
                  <div className='relative'>
                    <Euro className='absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400' />
                    <input
                      type='number'
                      step='0.01'
                      min='0'
                      value={customPrice}
                      onChange={(e) => setCustomPrice(e.target.value)}
                      className='w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:border-transparent'
                      placeholder='3.49'
                      autoFocus
                    />
                  </div>
                  <p className='text-sm text-gray-400 mt-1'>
                    Default price: {currentDrink.defaultPrice} €
                  </p>
                </div>

                <div className='flex gap-3 mt-6'>
                  <motion.button
                    onClick={confirmDrinkSelection}
                    className='flex-1 bg-green-500 hover:bg-green-600 text-black font-bold py-3 px-4 rounded-lg transition-colors monster-subtitle'
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={customPrice === '' || parseFloat(customPrice) < 0}
                  >
                    Add Monster
                  </motion.button>
                  <motion.button
                    onClick={cancelSelection}
                    className='flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-4 rounded-lg transition-colors monster-subtitle'
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Cancel
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default DrinkSelector;
