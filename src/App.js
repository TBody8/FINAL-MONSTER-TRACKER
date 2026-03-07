import React, { useState, useEffect, lazy, Suspense, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Settings as SettingsIcon, Menu, X } from 'lucide-react';
import './App.css';
import * as mockData from './data/mockData';
import Loader from './components/ui/Loader';
import PartyMeter from './components/PartyMeter';
import HamburgerMenu from './components/HamburgerMenu';
import { detectConsumptionAnomalies, useAIInsights } from './utils/aiInsights';
import Strike1WarningModal from './components/Strike1WarningModal';
import BannedScreenModal from './components/BannedScreenModal';

// Lazy load heavy components
const Dashboard = lazy(() => import('./components/Dashboard'));
const Settings = lazy(() => import('./components/Settings'));
const Notifications = lazy(() => import('./components/Notifications'));
const Login = lazy(() => import('./components/Login'));
const Register = lazy(() => import('./components/Register'));
const MonsterWrapped = lazy(() => import('./components/MonsterWrapped'));
const Leaderboard = lazy(() => import('./components/Leaderboard'));
const KingsAura = lazy(() => import('./components/KingsAura'));
const UpdateModal = lazy(() => import('./components/UpdateModal'));
const PWAInstallGuideModal = lazy(() => import('./components/PWAInstallGuideModal'));

function App() {
  const [consumptionData, setConsumptionData] = useState([]);
  const [selectedDrinks, setSelectedDrinks] = useState([]);
  const [showSettings, setShowSettings] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [bestStreak, setBestStreak] = useState(0);

  const [goals, setGoals] = useState({});
  const [settings, setSettings] = useState({});

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const [userRank, setUserRank] = useState(null);
  const [showRegister, setShowRegister] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showStrike1Warning, setShowStrike1Warning] = useState(false);
  const [bannedState, setBannedState] = useState(null);
  const [showHamburger, setShowHamburger] = useState(false);
  const [showPWAInstallGuide, setShowPWAInstallGuide] = useState(false);
  const [activeIAModal, setActiveIAModal] = useState(null); // 'anomaly' | 'streak' | 'partyMeter' | null
  const [showWrapped, setShowWrapped] = useState(false);
  // Wrapped Activation Logic
  const checkIsWrappedActive = () => {
    const now = new Date();
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0); // Last day of current month
    // Active if it's the last 2 days of a month, or the first 2 days of a month
    return now.getDate() >= lastDay.getDate() - 2 || now.getDate() <= 2;
  };
  const isWrappedActive = checkIsWrappedActive();
  const [userProfile, setUserProfile] = useState(() => {
    const sex = localStorage.getItem('partyMeterSex');
    const weight = localStorage.getItem('partyMeterWeight');
    return { sex, weight };
  });

  useEffect(() => {
    const handleBanned = (e) => {
      if (e.detail && e.detail.message) {
          setBannedState({
            type: 'perma',
            message: e.detail.message,
            ban_until: e.detail.ban_until
          });
      } else if (typeof e.detail === 'string') {
          setBannedState({
            type: 'perma',
            message: e.detail,
            ban_until: null
          });
      }
    };
    window.addEventListener('userBanned', handleBanned);
    return () => window.removeEventListener('userBanned', handleBanned);
  }, []);

  const fetchUserData = useCallback((username) => {
    const backendUrl = process.env.REACT_APP_BACKEND_URL || '';
    return Promise.all([
      fetch(`${backendUrl}/api/consumption`, { credentials: 'include' }).then((res) => (res.ok ? res.json() : [])),
      fetch(`${backendUrl}/api/goals`, { credentials: 'include' }).then((res) => (res.ok ? res.json() : {})),
      fetch(`${backendUrl}/api/settings`, { credentials: 'include' }).then((res) => (res.ok ? res.json() : {})),
      fetch(`${backendUrl}/api/leaderboard`, { credentials: 'include' }).then((res) => (res.ok ? res.json() : [])),
    ]).then(([consumption, goals, settings, leaderboard]) => {
      setConsumptionData(consumption);
      setGoals(goals);
      setSettings(settings);

      if (leaderboard && leaderboard.length > 0 && username) {
        const uIndex = leaderboard.findIndex((u) => u.username === username);
        setUserRank(uIndex !== -1 ? uIndex + 1 : null);
      } else {
        setUserRank(null);
      }

      setInitialLoading(false);
      setLoading(false);

      // Check for App Updates (v2.1)
      const updateKey = 'monsterTracker_v2_1_seen';
      if (!localStorage.getItem(updateKey)) {
        setTimeout(() => {
          setShowUpdateModal(true);
          localStorage.setItem(updateKey, 'true');
        }, 1500);
      }

      // Check for PWA Tutorial (Mobile Only, Non-Standalone, Once per User)
      const pwaGuideKey = 'monsterTracker_pwaGuide_seen';
      if (!localStorage.getItem(pwaGuideKey)) {
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches || navigator.standalone;
        
        if (isMobile && !isStandalone) {
          setTimeout(() => {
            setShowPWAInstallGuide(true);
            localStorage.setItem(pwaGuideKey, 'true');
          }, 3000); // Show slightly after update modal resolves or on boot
        }
      }

      // Notify user about Monster Wrapped
      if (isWrappedActive) {
        const now = new Date();
        const notifiedKey = `wrappedNotified_${now.getFullYear()}_${now.getMonth()}`;
        if (!localStorage.getItem(notifiedKey)) {
          localStorage.setItem(notifiedKey, 'true');
          setTimeout(() => {
            setNotifications(prev => [...prev, {
              id: Date.now(),
              message: "¡Tu Monster Wrapped Mensual está listo! 🎉"
            }]);
          }, 2000);
        }
      }
    });
  }, [isWrappedActive]);

  useEffect(() => {
    const backendUrl = process.env.REACT_APP_BACKEND_URL || '';
    
    // Check if the user has an active HttpOnly session
    fetch(`${backendUrl}/api/auth/me`, { credentials: 'include' })
      .then((res) => {
        if (!res.ok) throw new Error('Not authenticated');
        return res.json();
      })
      .then((userData) => {
        setUser({ username: userData.username });
        fetchUserData(userData.username);
      })
      .catch(() => {
        // No active session cookie
        setUser(null);
        setInitialLoading(false);
        setLoading(false);
      });
  }, [fetchUserData]);

  const handleLogin = (userObj) => {
    setUser(userObj);
    localStorage.setItem('monsterTrackerUser', userObj.username);
    setLoading(true);
    fetchUserData(userObj.username);
  };

  const handleLogout = () => {
    const backendUrl = process.env.REACT_APP_BACKEND_URL || '';
    fetch(`${backendUrl}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include'
    }).then(() => {
        setUser(null);
        setConsumptionData([]);
        localStorage.removeItem('monsterTrackerUser');
    }).catch(err => console.error(err));
  };

  const refreshUserRank = useCallback(() => {
    if (!user) return;
    const backendUrl = process.env.REACT_APP_BACKEND_URL || '';
    fetch(`${backendUrl}/api/leaderboard`, {
      credentials: 'include'
    })
      .then(res => res.ok ? res.json() : [])
      .then(leaderboard => {
        const currentUsername = localStorage.getItem('monsterTrackerUser');
        if (leaderboard && leaderboard.length > 0 && currentUsername) {
          const uIndex = leaderboard.findIndex((u) => u.username === currentUsername);
          setUserRank(uIndex !== -1 ? uIndex + 1 : null);
        } else {
          setUserRank(null);
        }
      })
      .catch(err => console.error("Error refreshing rank:", err));
  }, [user]);

  // Guardar solo el día modificado
  const saveConsumptionDay = useCallback(
    (day) => {
      if (!user) return;
      const dayWithUser = { ...day, username: user.username };
      const backendUrl = process.env.REACT_APP_BACKEND_URL || '';
      fetch(`${backendUrl}/api/consumption`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(dayWithUser),
      })
        .then((res) => {
          if (res.status === 429) {
            localStorage.setItem('mt_uuid_ban', 'true');
            handleLogout();
            res.json().then(errorData => {
                setBannedState({
                  type: 'kick',
                  message: errorData.detail?.message || 'Has sido bloqueado temporalmente por spam.',
                  ban_until: errorData.detail?.ban_until || null
                });
            }).catch(() => {
                setBannedState({ type: 'kick', message: 'Has sido bloqueado temporalmente por spam.', ban_until: null });
            });
            throw new Error('too_many_requests_ban');
          }
          if (res.status === 403) {
             handleLogout();
             res.json().then(errorData => {
                 setBannedState({
                   type: 'perma',
                   message: errorData.detail?.message || (typeof errorData.detail === 'string' ? errorData.detail : 'Tu cuenta está temporal o permanentemente suspendida.'),
                   ban_until: errorData.detail?.ban_until || null
                 });
             }).catch(() => {
                 setBannedState({ type: 'perma', message: 'Tu cuenta está temporal o permanentemente suspendida.', ban_until: null });
             });
            throw new Error('banned');
          }
          if (!res.ok) {
            console.error(
              '[FRONTEND] Error al guardar consumo:',
              res.status,
              res.statusText
            );
          }
          return res.json().catch(() => null);
        })
        .then((data) => {
          if (data) {
             refreshUserRank();
          }
        })
        .catch((err) => {
          console.error('[FRONTEND] Error de red al guardar consumo:', err);
        });
    },
    [user, refreshUserRank]
  );

  const handleDrinkSelect = useCallback(
    (drink) => {
      const targetDate = drink.date || new Date().toISOString().split('T')[0];
      const targetData = consumptionData.find((d) => d.date === targetDate);

      let isSpamTriggered = false;
      const dismissTime = parseInt(localStorage.getItem('strike1_dismiss_time') || '0', 10);
      
      if (dismissTime > 0) {
        if (Date.now() - dismissTime <= 5000) {
          let postClicks = parseInt(localStorage.getItem('post_strike_clicks') || '0', 10);
          postClicks += 1;
          localStorage.setItem('post_strike_clicks', postClicks.toString());
          
          if (postClicks >= 2) { 
            isSpamTriggered = true;
          }
        } else {
          localStorage.removeItem('strike1_dismiss_time');
          localStorage.removeItem('post_strike_clicks');
        }
      }

      const safeCaffeineAmount = Math.max(0, drink.caffeine || 0);
      const drinkPrice = drink.selectedPrice !== undefined ? drink.selectedPrice : (drink.defaultPrice || 0);

      const drinkWithPrice = {
        id: String(drink.id), 
        price: drinkPrice,
        timestamp: new Date().toISOString(),
      };

      let currentDayLength = 1;

      if (targetData) {
        const updatedDay = {
            ...targetData,
            drinks: [...targetData.drinks, drinkWithPrice],
            totalCaffeine: Math.max(0, (targetData.totalCaffeine || 0) + safeCaffeineAmount),
            totalCost: Math.max(0, (targetData.totalCost || 0) + drinkPrice),
            spam_trigger: isSpamTriggered
        };
        currentDayLength = updatedDay.drinks.length;
        const updatedData = consumptionData.map((d) => d.date === targetDate ? updatedDay : d);
        setConsumptionData(updatedData);
        saveConsumptionDay(updatedDay);
      } else {
        const newDay = {
            date: targetDate,
            drinks: [drinkWithPrice],
            totalCaffeine: safeCaffeineAmount,
            totalCost: drinkPrice,
            spam_trigger: isSpamTriggered
        };
        currentDayLength = newDay.drinks.length;
        const newData = [...consumptionData, newDay];
        newData.sort((a, b) => new Date(b.date) - new Date(a.date));
        setConsumptionData(newData);
        saveConsumptionDay(newDay);
      }

      setSelectedDrinks((prev) => [...prev, drink]);

      // Mandatory Anti-Cheat Warning (Independent of User Settings)
      if (targetDate === new Date().toISOString().split('T')[0] && currentDayLength === 4 && !isSpamTriggered) {
          setShowStrike1Warning(true);
      } 
      // Optional User Success Notification
      else if (!isSpamTriggered) {
          if (goals.enableNotifications !== false) { // Default to true if undefined
              addNotification({
                type: 'success',
                title: 'Monster Added!',
                message: `${drink.name} added to your tracker.`,
                autoHide: true,
                duration: 3000,
              });
          }
      }
    },
    [consumptionData, goals, saveConsumptionDay]
  );

  const handleDrinkDelete = useCallback(
    (drinkIndex, targetDate = null) => {
      const dateStr = targetDate || new Date().toISOString().split('T')[0];
      const targetData = consumptionData.find((d) => d.date === dateStr);

      if (!targetData || !targetData.drinks[drinkIndex]) return;

      // Get the drink being deleted para notificación
      const deletedDrink = targetData.drinks[drinkIndex];
      const deletedDrinkData = mockData.monsterDrinks.find(
        (d) => d.id === deletedDrink.id
      );
      const deletedCaffeine = deletedDrinkData?.caffeine || 0;
      const deletedPrice = deletedDrink.price || 0;

      // Remove the drink and update totals
      const updatedDrinks = targetData.drinks.filter(
        (_, index) => index !== drinkIndex
      );
      const updatedCaffeine = Math.max(
        0,
        targetData.totalCaffeine - deletedCaffeine
      );
      const updatedCost = Math.max(
        0,
        (targetData.totalCost || 0) - deletedPrice
      );

      let updatedData;
      if (updatedDrinks.length === 0) {
        updatedData = consumptionData.filter((d) => d.date !== dateStr);
      } else {
        updatedData = consumptionData.map((d) =>
          d.date === dateStr
            ? {
                ...d,
                drinks: updatedDrinks,
                totalCaffeine: updatedCaffeine,
                totalCost: updatedCost,
              }
            : d
        );
      }

      setConsumptionData(updatedData);
      
      if (updatedDrinks.length === 0) {
        // Option A: Delete from backend
        const backendUrl = process.env.REACT_APP_BACKEND_URL || '';
        fetch(`${backendUrl}/api/consumption/${dateStr}`, {
          method: 'DELETE',
          credentials: 'include',
        })
        .then(() => refreshUserRank())
        .catch(err => console.error("Error deleting empty day:", err));
      } else {
        saveConsumptionDay(updatedData.find((d) => d.date === dateStr));
      }

      // Update selected drinks for today
      setSelectedDrinks((prev) => {
        const newSelected = [...prev];
        const indexToRemove = newSelected.findIndex(
          (drink) => drink.id === deletedDrink.id
        );
        if (indexToRemove > -1) {
          newSelected.splice(indexToRemove, 1);
        }
        return newSelected;
      });

      // Show deletion notification
      addNotification({
        type: 'info',
        title: 'Monster Removed',
        message: `${deletedDrinkData?.name || 'Drink'} ($${deletedPrice.toFixed(
          2
        )}) has been removed from today's consumption.`,
        autoHide: true,
        duration: 3000,
      });
    },
    [consumptionData, saveConsumptionDay, refreshUserRank]
  );

  const addNotification = (notification) => {
    const id = Date.now().toString();
    setNotifications((prev) => [...prev, { ...notification, id }]);
  };

  const dismissNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const handleGoalsUpdate = (newGoals) => {
    setGoals(newGoals);
    // No localStorage
    const backendUrl = process.env.REACT_APP_BACKEND_URL || '';
    fetch(`${backendUrl}/api/goals`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify(newGoals),
    });
  };

  const handleSettingsUpdate = (newSettings) => {
    setSettings(newSettings);
    // No localStorage
    const backendUrl = process.env.REACT_APP_BACKEND_URL || '';
    fetch(`${backendUrl}/api/settings`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify(newSettings),
    });
  };

  // Guardar sexo y peso para PartyMeter
  const handleSavePartyProfile = ({ sex, weight }) => {
    setUserProfile({ sex, weight });
    localStorage.setItem('partyMeterSex', sex);
    localStorage.setItem('partyMeterWeight', weight);
  };

  // Guardar sexo y peso para PartyMeter desde settings
  useEffect(() => {
    if (settings.partyMeterSex && settings.partyMeterWeight) {
      setUserProfile({
        sex: settings.partyMeterSex,
        weight: settings.partyMeterWeight,
      });
      localStorage.setItem('partyMeterSex', settings.partyMeterSex);
      localStorage.setItem('partyMeterWeight', settings.partyMeterWeight);
    }
  }, [settings.partyMeterSex, settings.partyMeterWeight]);

  // Sincroniza el perfil PartyMeter con settings al abrir el modal
  useEffect(() => {
    if (activeIAModal === 'partyMeter') {
      if (settings.partyMeterSex && settings.partyMeterWeight) {
        setUserProfile({
          sex: settings.partyMeterSex,
          weight: settings.partyMeterWeight,
        });
        localStorage.setItem('partyMeterSex', settings.partyMeterSex);
        localStorage.setItem('partyMeterWeight', settings.partyMeterWeight);
      }
    }
  }, [activeIAModal, settings.partyMeterSex, settings.partyMeterWeight]);

  if (initialLoading) return <Loader />;
  if (loading) return <Loader />;
  if (!user) {
    return (
      <div className="relative min-h-screen bg-black overflow-hidden">
        <Suspense fallback={<Loader />}>
          {showRegister ? (
            <Register
              onRegister={handleLogin}
              onSwitchToLogin={() => setShowRegister(false)}
            />
          ) : (
            <Login
              onLogin={handleLogin}
              onSwitchToRegister={() => setShowRegister(true)}
            />
          )}
          {bannedState && (
            <BannedScreenModal
              type={bannedState.type}
              message={bannedState.message}
              banUntil={bannedState.ban_until}
              onClose={() => setBannedState(null)}
            />
          )}
        </Suspense>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-black text-white relative overflow-hidden'>
      {/* Animated Background */}
      <div className='fixed inset-0 z-0'>
        <div className='absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black'>
          <motion.div
            className='absolute top-0 left-0 w-full h-full opacity-10'
            animate={{
              background: [
                'radial-gradient(circle at 20% 50%, #00ff41 0%, transparent 50%)',
                'radial-gradient(circle at 80% 20%, #00ff41 0%, transparent 50%)',
                'radial-gradient(circle at 40% 80%, #00ff41 0%, transparent 50%)',
                'radial-gradient(circle at 20% 50%, #00ff41 0%, transparent 50%)',
              ],
            }}
            transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
          />
        </div>
        {userRank === 1 && (
          <Suspense fallback={null}>
            <KingsAura />
          </Suspense>
        )}
      </div>

      {/* Notifications */}
      <Suspense fallback={<Loader />}>
        <Notifications
          notifications={notifications}
          onDismiss={dismissNotification}
        />
      </Suspense>
      
      <Strike1WarningModal
         isOpen={showStrike1Warning}
         onClose={() => setShowStrike1Warning(false)}
      />

      {/* Header */}
      <motion.header
        className='relative z-10 p-6 border-b border-green-500/20 backdrop-blur-md'
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        <div className='max-w-7xl mx-auto flex justify-between items-center'>
          <motion.div className='flex flex-col items-start'>
            <motion.h1
              className='monster-title text-4xl md:text-6xl lg:text-7xl bg-gradient-to-r from-green-300 via-green-400 to-green-500 bg-clip-text text-transparent whitespace-nowrap'
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              animate={{
                textShadow: [
                  '0 0 10px rgba(0, 255, 65, 0.5)',
                  '0 0 20px rgba(0, 255, 65, 0.8)',
                  '0 0 10px rgba(0, 255, 65, 0.5)',
                ],
              }}
              style={{
                WebkitTextStroke: '1px rgba(0, 255, 65, 0.3)',
              }}
            >
              Monster Tracker
            </motion.h1>
            
            <motion.p
              className='monster-subtitle text-sm md:text-lg text-green-400/80 whitespace-nowrap mt-1'
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              Unleash Your Energy Data
            </motion.p>
            
            {userRank !== null && userRank <= 3 && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                className={`mt-3 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-lg border-2 font-black text-lg md:text-xl shadow-[0_0_20px_rgba(255,255,255,0.1)] 
                  ${userRank === 1 ? 'bg-yellow-500/20 border-yellow-500 text-yellow-400 shadow-[0_0_20px_rgba(234,179,8,0.5)]' : 
                    userRank === 2 ? 'bg-gray-300/20 border-gray-300 text-gray-200' : 'bg-amber-700/30 border-amber-600 text-amber-500'}
                `}
              >
                {userRank}º
              </motion.div>
            )}
          </motion.div>

          {/* Desktop Navigation */}
          <nav className='hidden md:flex items-center gap-6'>
            <motion.button
              onClick={() => setShowSettings(true)}
              className='p-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-all duration-300 hover:scale-105'
              initial={{ opacity: 0, rotate: -10 }}
              animate={{ opacity: 1, rotate: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              whileHover={{ scale: 1.1, rotate: 10 }}
              whileTap={{ scale: 0.9 }}
            >
              <SettingsIcon className='w-6 h-6' />
            </motion.button>
            <button
              onClick={handleLogout}
              className='ml-4 px-3 py-2 bg-gray-800 text-white rounded hover:bg-red-600 transition'
            >
              Logout
            </button>
          </nav>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className='relative z-10 max-w-7xl mx-auto p-4 md:p-6'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <Suspense fallback={<Loader />}>
            <Dashboard
              consumptionData={consumptionData}
              goals={goals}
              bestStreak={bestStreak}
              setBestStreak={setBestStreak}
              onDrinkDelete={handleDrinkDelete}
              onDrinkSelect={handleDrinkSelect}
              selectedDrinks={selectedDrinks}
            />
          </Suspense>
        </motion.div>
      </main>

      {/* Settings Modal */}
      <Suspense fallback={<Loader />}>
        <Settings
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
          goals={goals}
          onGoalsUpdate={handleGoalsUpdate}
          settings={settings}
          onSettingsUpdate={handleSettingsUpdate}
          onShowPWAGuide={() => setShowPWAInstallGuide(true)}
        />
        <UpdateModal 
          isOpen={showUpdateModal}
          onClose={() => setShowUpdateModal(false)}
        />
        <PWAInstallGuideModal
          isOpen={showPWAInstallGuide}
          onClose={() => setShowPWAInstallGuide(false)}
        />
      </Suspense>

      {/* IA Modals & Leaderboard */}
      {activeIAModal === 'partyMeter' && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/80'>
          <div className='w-full max-w-lg mx-auto relative'>
            <button
              className='absolute top-2 right-2 z-20 text-white bg-pink-700 rounded-full p-2 shadow-lg'
              onClick={() => setActiveIAModal(null)}
            >
              <X className='w-6 h-6' />
            </button>
            <PartyMeter
              userSex={userProfile.sex}
              userWeight={userProfile.weight}
              onSaveProfile={handleSavePartyProfile}
            />
          </div>
        </div>
      )}

      {activeIAModal === 'leaderboard' && (
        <Suspense fallback={<Loader />}>
          <Leaderboard 
            onClose={() => setActiveIAModal(null)} 
          />
        </Suspense>
      )}
      <button
        className={`fixed top-6 right-6 p-3 border rounded-full shadow-lg transition-all duration-300 md:hidden z-10 ${
          showHamburger || showSettings || activeIAModal === 'partyMeter'
            ? 'backdrop-blur-sm brightness-75 scale-95 border-green-500/30 bg-gray-900/80'
            : isWrappedActive
              ? 'bg-yellow-500/10 border-yellow-400/50 shadow-[0_0_15px_rgba(250,204,21,0.4)] animate-slow-pulse'
              : 'border-green-500/30 bg-gray-900/80'
        }`}
        onClick={() => {
          if (
            !(showHamburger || showSettings || activeIAModal === 'partyMeter')
          ) {
            setShowHamburger(true);
          }
        }}
        aria-label='Abrir menú'
        style={{ display: 'flex', alignItems: 'center' }} // z-10 for below modal
        disabled={
          showHamburger || showSettings || activeIAModal === 'partyMeter'
        }
      >
        <Menu className='w-7 h-7 text-green-400' />
      </button>
      <HamburgerMenu
        open={showHamburger}
        onClose={() => setShowHamburger(false)}
        isWrappedActive={isWrappedActive}
        onSelect={(key) => {
          if (key === 'settings') {
            setShowSettings(true);
          } else if (key === 'logout') {
            handleLogout();
          } else if (key === 'wrapped') {
            setShowWrapped(true);
          } else {
            setActiveIAModal(key);
          }
          setShowHamburger(false);
        }}
      />
      
      {/* Monster Wrapped Modal */}
      {showWrapped && (
        <Suspense fallback={<Loader />}>
          <MonsterWrapped 
            consumptionData={consumptionData} 
            onClose={() => setShowWrapped(false)} 
          />
        </Suspense>
      )}
    </div>
  );
}

export default App;
