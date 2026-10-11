import React, { useState, useEffect } from 'react';
import { X, UserCheck, Sparkles, Check, Globe } from 'lucide-react';
import { TravelerProfile } from '../types';
import { soundManager } from '../utils/audio';
import { generateRandomPassportNumber } from '../utils/sampleData';
import { sanitizeText, sanitizeAlphaNumeric, validateTravelerProfile } from '../utils/security';

interface EditTravelerModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: TravelerProfile;
  onSave: (updatedProfile: TravelerProfile) => void;
}

export const EditTravelerModal: React.FC<EditTravelerModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSave
}) => {
  const [fullName, setFullName] = useState(profile.fullName);
  const [passportNumber, setPassportNumber] = useState(profile.passportNumber);
  const [language, setLanguage] = useState<'Spanish' | 'English'>(
    profile.language === 'English' || (profile.language as string) === 'Inglés' ? 'English' : 'Spanish'
  );

  // Sync state whenever modal is opened with the current profile
  useEffect(() => {
    if (isOpen) {
      setFullName(profile.fullName || '');
      setPassportNumber(profile.passportNumber || generateRandomPassportNumber());
      setLanguage(
        profile.language === 'English' || (profile.language as string) === 'Inglés' ? 'English' : 'Spanish'
      );
    }
  }, [isOpen, profile]);

  if (!isOpen) return null;

  const handleGeneratePassportNumber = () => {
    setPassportNumber(generateRandomPassportNumber());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = sanitizeText(fullName, 60);
    const cleanNum = sanitizeAlphaNumeric(passportNumber, 15).toUpperCase();

    const updated = validateTravelerProfile({
      ...profile,
      fullName: cleanName,
      passportNumber: cleanNum || profile.passportNumber || generateRandomPassportNumber(),
      language: language
    });

    soundManager.playPageTurn();
    onSave(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-stone-900 border border-stone-700 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl flex flex-col text-stone-100 max-h-[90vh]">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-cinzel font-bold text-amber-200 uppercase tracking-wide">
                Traveler Details
              </h3>
              <p className="text-[11px] text-stone-400">
                Official identification of the passport bearer
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-stone-800 text-stone-400 hover:text-stone-200 transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4">
          
          {/* Full Name */}
          <div>
            <label htmlFor="input-traveler-fullname" className="block text-[11px] font-mrz font-bold text-stone-300 uppercase mb-1">
              Full Name *
            </label>
            <input
              id="input-traveler-fullname"
              name="fullName"
              type="text"
              required
              maxLength={60}
              autoComplete="name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. John Smith"
              className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-700 text-stone-100 text-xs focus:outline-none focus:border-amber-500 font-medium tracking-wide"
            />
          </div>

          {/* Passport Number with Random Generator */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="input-traveler-passport-num" className="text-[11px] font-mrz font-bold text-stone-300 uppercase">
                Passport Number *
              </label>
              <button
                type="button"
                onClick={handleGeneratePassportNumber}
                className="text-[10px] text-amber-400 hover:text-amber-300 flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Sparkles className="w-3 h-3" />
                <span>Generate Another</span>
              </button>
            </div>
            <input
              id="input-traveler-passport-num"
              name="passportNumber"
              type="text"
              required
              maxLength={15}
              autoComplete="off"
              value={passportNumber}
              onChange={(e) => setPassportNumber(e.target.value.toUpperCase())}
              className="w-full px-3.5 py-2 rounded-xl bg-stone-950 border border-stone-700 text-rose-300 font-mono font-bold text-xs uppercase tracking-wider focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Nationality - Automatically Mexican */}
          <div>
            <label className="block text-[11px] font-mrz font-bold text-stone-300 uppercase mb-1">
              Nationality
            </label>
            <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-stone-950/80 border border-emerald-500/40 text-stone-100">
              <div className="flex items-center gap-2">
                <span className="text-base" role="img" aria-label="Mexico Flag">🇲🇽</span>
                <span className="font-bold text-xs tracking-wider text-emerald-300">MEXICAN</span>
              </div>
              <span className="text-[10px] font-mono font-bold bg-emerald-950/60 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/30">
                MEX • Automatic
              </span>
            </div>
          </div>

          {/* Language Selection: Spanish & English */}
          <div>
            <label className="block text-[11px] font-mrz font-bold text-stone-300 uppercase mb-1.5 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-amber-400" />
              <span>Language *</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setLanguage('Spanish')}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  language === 'Spanish'
                    ? 'bg-amber-500 text-stone-950 border-amber-400 shadow-md shadow-amber-500/20'
                    : 'bg-stone-950 text-stone-400 border-stone-800 hover:border-stone-700 hover:text-stone-200'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-current"></span>
                <span>Spanish</span>
              </button>

              <button
                type="button"
                onClick={() => setLanguage('English')}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  language === 'English'
                    ? 'bg-amber-500 text-stone-950 border-amber-400 shadow-md shadow-amber-500/20'
                    : 'bg-stone-950 text-stone-400 border-stone-800 hover:border-stone-700 hover:text-stone-200'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-current"></span>
                <span>English</span>
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-3 border-t border-stone-800">
            <button
              type="submit"
              className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold text-xs shadow-md transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Save Details</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
