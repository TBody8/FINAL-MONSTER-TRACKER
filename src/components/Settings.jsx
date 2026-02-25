import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Settings as SettingsIcon,
  Target,
  Moon,
  Zap,
  Save,
  X,
  Wine,
} from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

const Settings = ({
  isOpen,
  onClose,
  goals,
  onGoalsUpdate,
  settings,
  onSettingsUpdate,
}) => {
  const [localGoals, setLocalGoals] = useState(goals);
  const [localSettings, setLocalSettings] = useState(settings);

  const handleSave = () => {
    onGoalsUpdate(localGoals);
    onSettingsUpdate(localSettings);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <motion.div
      className='fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4'
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className='bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-4 md:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-green-500/20'
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className='flex items-center justify-between mb-8'>
          <div className='flex items-center gap-3'>
            <div className='p-2 bg-green-500 rounded-lg'>
              <SettingsIcon className='w-6 h-6 text-black' />
            </div>
            <h2 className='text-3xl font-bold text-white'>Settings</h2>
          </div>
          <Button
            onClick={onClose}
            variant='ghost'
            size='sm'
            className='text-gray-400 hover:text-white'
          >
            <X className='w-5 h-5' />
          </Button>
        </div>

        <div className='space-y-8'>
          {/* Goals Section */}
          <Card className='bg-gray-800 border-green-500/20 p-6'>
            <div className='flex items-center gap-3 mb-6'>
              <Target className='w-5 h-5 text-green-400' />
              <h3 className='text-xl font-semibold text-white'>
                Consumption Goals
              </h3>
            </div>

            <div className='space-y-6'>
              <div className='flex items-center justify-between'>
                <Label className='text-white'>Enable Daily Limit</Label>
                <Switch
                  checked={localGoals.enableDailyLimit}
                  onCheckedChange={(checked) =>
                    setLocalGoals({ ...localGoals, enableDailyLimit: checked })
                  }
                />
              </div>

              {localGoals.enableDailyLimit && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  transition={{ duration: 0.3 }}
                >
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <div>
                      <Label className='text-white mb-2 block'>
                        Daily Caffeine Limit (mg)
                      </Label>
                      <input
                        type='number'
                        value={localGoals.dailyLimit}
                        onChange={(e) =>
                          setLocalGoals({
                            ...localGoals,
                            dailyLimit: parseInt(e.target.value) || 0,
                          })
                        }
                        className='w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:border-transparent'
                        placeholder='400'
                      />
                    </div>
                    <div>
                      <Label className='text-white mb-2 block'>
                        Limit Type
                      </Label>
                      <Select
                        value={localGoals.limitType}
                        onValueChange={(value) =>
                          setLocalGoals({ ...localGoals, limitType: value })
                        }
                      >
                        <SelectTrigger className='bg-gray-700 border-gray-600 text-white'>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='daily'>Daily</SelectItem>
                          <SelectItem value='weekly'>Weekly</SelectItem>
                          <SelectItem value='monthly'>Monthly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </motion.div>
              )}

              <div className='flex items-center justify-between'>
                <Label className='text-white'>Enable Notifications</Label>
                <Switch
                  checked={localGoals.enableNotifications}
                  onCheckedChange={(checked) =>
                    setLocalGoals({
                      ...localGoals,
                      enableNotifications: checked,
                    })
                  }
                />
              </div>
            </div>
          </Card>

          {/* Appearance Section */}
          <Card className='bg-gray-800 border-green-500/20 p-6'>
            <div className='flex items-center gap-3 mb-6'>
              <Moon className='w-5 h-5 text-blue-400' />
              <h3 className='text-xl font-semibold text-white'>Appearance</h3>
            </div>

            <div className='space-y-6'>
              <div>
                <Label className='text-white mb-2 block'>
                  Dark Mode Contrast
                </Label>
                <Select
                  value={localSettings.darkModeContrast}
                  onValueChange={(value) =>
                    setLocalSettings({
                      ...localSettings,
                      darkModeContrast: value,
                    })
                  }
                >
                  <SelectTrigger className='bg-gray-700 border-gray-600 text-white'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='low'>Low Contrast</SelectItem>
                    <SelectItem value='normal'>Normal</SelectItem>
                    <SelectItem value='high'>High Contrast</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className='text-white mb-2 block'>
                  Animation Intensity
                </Label>
                <Select
                  value={localSettings.animationIntensity}
                  onValueChange={(value) =>
                    setLocalSettings({
                      ...localSettings,
                      animationIntensity: value,
                    })
                  }
                >
                  <SelectTrigger className='bg-gray-700 border-gray-600 text-white'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='minimal'>Minimal</SelectItem>
                    <SelectItem value='normal'>Normal</SelectItem>
                    <SelectItem value='enhanced'>Enhanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className='flex items-center justify-between'>
                <Label className='text-white'>Reduced Motion</Label>
                <Switch
                  checked={localSettings.reducedMotion}
                  onCheckedChange={(checked) =>
                    setLocalSettings({
                      ...localSettings,
                      reducedMotion: checked,
                    })
                  }
                />
              </div>
            </div>
          </Card>

          {/* Performance Section */}
          <Card className='bg-gray-800 border-green-500/20 p-6'>
            <div className='flex items-center gap-3 mb-6'>
              <Zap className='w-5 h-5 text-yellow-400' />
              <h3 className='text-xl font-semibold text-white'>Performance</h3>
            </div>

            <div className='space-y-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <Label className='text-white'>Auto-refresh Data</Label>
                  <p className='text-gray-400 text-sm'>
                    Automatically refresh consumption data
                  </p>
                </div>
                <Switch
                  checked={localSettings.autoRefresh}
                  onCheckedChange={(checked) =>
                    setLocalSettings({ ...localSettings, autoRefresh: checked })
                  }
                />
              </div>

              <div className='flex items-center justify-between'>
                <div>
                  <Label className='text-white'>Show Advanced Stats</Label>
                  <p className='text-gray-400 text-sm'>
                    Display detailed analytics and metrics
                  </p>
                </div>
                <Switch
                  checked={localSettings.showAdvancedStats}
                  onCheckedChange={(checked) =>
                    setLocalSettings({
                      ...localSettings,
                      showAdvancedStats: checked,
                    })
                  }
                />
              </div>
            </div>
          </Card>

          {/* PartyMeter Profile Section */}
          <Card className='bg-gray-800 border-pink-400/40 p-6 mt-8'>
            <div className='flex items-center gap-3 mb-6'>
              <Wine className='w-5 h-5 text-pink-300' />
              <h3 className='text-xl font-semibold text-white'>
                Perfil para Medidor de Borrachera
              </h3>
            </div>
            <div className='space-y-4'>
              <div className='flex items-center gap-4'>
                <Label className='text-white'>Género</Label>
                <Select
                  value={localSettings.partyMeterSex || 'male'}
                  onValueChange={(value) =>
                    setLocalSettings({ ...localSettings, partyMeterSex: value })
                  }
                >
                  <SelectTrigger className='bg-gray-700 border-gray-600 text-white w-32'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='male'>Hombre</SelectItem>
                    <SelectItem value='female'>Mujer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className='flex items-center gap-4'>
                <Label className='text-white'>Peso (kg)</Label>
                <input
                  type='number'
                  min='30'
                  max='200'
                  value={localSettings.partyMeterWeight || ''}
                  onChange={(e) =>
                    setLocalSettings({
                      ...localSettings,
                      partyMeterWeight: e.target.value,
                    })
                  }
                  className='rounded px-2 py-1 bg-gray-700 text-white w-24 border border-gray-600'
                />
              </div>
              <p className='text-gray-400 text-xs mt-2'>
                Estos datos se usarán para los cálculos del Medidor de
                Borrachera.
              </p>
            </div>
          </Card>
        </div>

        <div className='flex gap-4 mt-8'>
          <Button
            onClick={handleSave}
            className='flex-1 bg-green-500 hover:bg-green-600 text-black font-semibold'
          >
            <Save className='w-4 h-4 mr-2' />
            Save Settings
          </Button>
          <Button
            onClick={onClose}
            variant='outline'
            className='flex-1 bg-gray-200 text-gray-900 border-gray-400 hover:bg-gray-300'
          >
            Cancel
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Settings;
