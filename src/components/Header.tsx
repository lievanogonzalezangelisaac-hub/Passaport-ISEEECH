import React, { useState } from 'react';
import { 
  Compass, BookOpen, QrCode, Volume2, VolumeX, 
  RotateCcw, Sparkles, Globe, User, Shield
} from 'lucide-react';
import { soundManager } from '../utils/audio';

interface HeaderProps {
  currentRole: 'traveler' | 'guide';
  onRoleChange: (role: 'traveler' | 'guide') => void;
  stampsCount: number;
  countriesCount: number;
  onResetData: () => void;
  onOpenScanner: () => void;
  onEditProfile?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  onRoleChange,
  stampsCount,
  countriesCount,
  onResetData,
  onOpenScanner,
  onEditProfile
}) => {
  const [soundEnabled, setSoundEnabled] = useState<boolean>(soundManager.enabled);

  const toggleSound = () => {
    const newState = !soundEnabled;
    soundManager.enabled = newState;
    setSoundEnabled(newState);
  };

  return (
    <header className="w-full bg-stone-900/90 border-b border-stone-800 backdrop-blur-md sticky top-0 z-40 px-3 sm:px-6 py-3">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        
        {/* Brand & Stats */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-stone-950 shadow-md">
              <Compass className="w-5 h-5 stroke-[2.4]" />
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-cinzel font-bold text-amber-100 leading-tight">
                {currentRole === 'traveler' ? 'Adventure Passport' : 'Pasaporte de Aventuras'}
              </h1>
              <div className="flex items-center gap-2 text-[10px] text-stone-400">
                {currentRole === 'traveler' ? (
                  <>
                    <span>{stampsCount} {stampsCount === 1 ? 'Stamp' : 'Stamps'}</span>
                    <span>•</span>
                    <span>{countriesCount} {countriesCount === 1 ? 'Country' : 'Countries'}</span>
                  </>
                ) : (
                  <>
                    <span>{stampsCount} {stampsCount === 1 ? 'Sello' : 'Sellos'}</span>
                    <span>•</span>
                    <span>{countriesCount} {countriesCount === 1 ? 'País' : 'Países'}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Mobile Sound, Edit and Reset icons */}
          <div className="flex items-center gap-1 sm:hidden">
            {currentRole === 'traveler' && onEditProfile && (
              <button
                onClick={onEditProfile}
                className="p-2 rounded-lg bg-stone-800 text-amber-400 hover:text-white"
                title="Fill in or edit traveler data"
              >
                <User className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={toggleSound}
              className="p-2 rounded-lg bg-stone-800 text-stone-300 hover:text-white"
              title={
                currentRole === 'traveler'
                  ? soundEnabled ? 'Sound Enabled' : 'Sound Muted'
                  : soundEnabled ? 'Sonido Activado' : 'Sonido Silenciado'
              }
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-amber-400" /> : <VolumeX className="w-4 h-4 text-stone-500" />}
            </button>
            <button
              onClick={onResetData}
              className="p-2 rounded-lg bg-stone-800 text-stone-400 hover:text-rose-400"
              title={currentRole === 'traveler' ? 'Reset demo data' : 'Reiniciar datos demo'}
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Center: ROLE SWITCHER (Traveler in English, Guide in Spanish) */}
        <div className="flex items-center p-1 bg-stone-950/80 rounded-xl border border-stone-800 shadow-inner w-full sm:w-auto justify-center">
          <button
            id="role-btn-traveler"
            onClick={() => onRoleChange('traveler')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              currentRole === 'traveler'
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 shadow-md font-bold'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Traveler User (Passport)</span>
          </button>

          <button
            id="role-btn-guide"
            onClick={() => onRoleChange('guide')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              currentRole === 'guide'
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 shadow-md font-bold'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <QrCode className="w-4 h-4" />
            <span>Usuario Guía (Crear QR)</span>
          </button>
        </div>

        {/* Desktop Quick Actions */}
        <div className="hidden sm:flex items-center gap-2">
          {currentRole === 'traveler' && (
            <>
              {onEditProfile && (
                <button
                  id="btn-header-edit-profile"
                  onClick={onEditProfile}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 hover:text-white text-xs font-medium border border-stone-700 transition-colors shadow-sm"
                  title="Fill in or edit your personal traveler details"
                >
                  <User className="w-3.5 h-3.5 text-amber-400" />
                  <span>Fill In Details</span>
                </button>
              )}
              <button
                id="btn-header-scanner"
                onClick={onOpenScanner}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-amber-300 hover:text-amber-200 text-xs font-medium border border-amber-500/30 transition-colors shadow-sm"
              >
                <QrCode className="w-3.5 h-3.5 text-amber-400" />
                <span>Scan QR Code</span>
              </button>
            </>
          )}

          <button
            id="btn-toggle-sound"
            onClick={toggleSound}
            className="p-2 rounded-lg bg-stone-800 text-stone-300 hover:text-white border border-stone-700 hover:border-stone-600 transition-colors"
            title={
              currentRole === 'traveler'
                ? soundEnabled ? 'Realistic paper and stamp sound effects enabled' : 'Sound muted'
                : soundEnabled ? 'Sonidos realistas activados (papel y sellos)' : 'Sonido silenciado'
            }
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-amber-400" /> : <VolumeX className="w-4 h-4 text-stone-500" />}
          </button>

          <button
            id="btn-reset-data"
            onClick={onResetData}
            className="p-2 rounded-lg bg-stone-800 text-stone-400 hover:text-rose-400 border border-stone-700 hover:border-rose-900/50 transition-colors"
            title={currentRole === 'traveler' ? 'Reset stamps to initial sample set' : 'Reiniciar sellos a los iniciales'}
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
