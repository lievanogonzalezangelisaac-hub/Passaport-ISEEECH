import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { PassportBook } from './components/PassportBook';
import { GuidePortal } from './components/GuidePortal';
import { QRScannerModal } from './components/QRScannerModal';
import { StampDetailModal } from './components/StampDetailModal';
import { EditTravelerModal } from './components/EditTravelerModal';
import { Stamp, TravelerProfile } from './types';
import { INITIAL_TRAVELER, createInitialTraveler, generateRandomPassportNumber, INITIAL_STAMPS } from './utils/sampleData';
import { soundManager } from './utils/audio';
import { 
  validateStampList, 
  validateTravelerProfile, 
  validateAndSanitizeStamp, 
  safeLocalStorageGet, 
  safeLocalStorageSet, 
  wipeAllStoredData 
} from './utils/security';
import { Compass, Sparkles, Award, MapPin, CheckCircle2, Edit3, ShieldCheck } from 'lucide-react';

const STORAGE_KEYS = {
  STAMPS: 'passport_device_stamps_persistent_v1',
  TRAVELER: 'passport_device_traveler_persistent_v1',
  ROLE: 'passport_device_role_persistent_v1'
};

export default function App() {
  // Load stamps from device persistent storage with schema validation
  const [stamps, setStamps] = useState<Stamp[]>(() => {
    return safeLocalStorageGet(STORAGE_KEYS.STAMPS, validateStampList, []);
  });

  // Load traveler profile from device persistent storage with schema validation
  const [traveler, setTraveler] = useState<TravelerProfile>(() => {
    return safeLocalStorageGet(STORAGE_KEYS.TRAVELER, validateTravelerProfile, createInitialTraveler());
  });

  // Load active view role from persistent storage
  const [currentRole, setCurrentRole] = useState<'traveler' | 'guide'>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ROLE);
      if (saved === 'guide' || saved === 'traveler') return saved;
    } catch {
      // Ignore
    }
    return 'traveler';
  });

  const [selectedStamp, setSelectedStamp] = useState<Stamp | null>(null);
  const [isScannerOpen, setIsScannerOpen] = useState<boolean>(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState<boolean>(false);
  const [lastGeneratedStamp, setLastGeneratedStamp] = useState<Stamp | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync state to persistent localStorage safely with error handling
  useEffect(() => {
    safeLocalStorageSet(STORAGE_KEYS.STAMPS, stamps);
  }, [stamps]);

  useEffect(() => {
    safeLocalStorageSet(STORAGE_KEYS.TRAVELER, traveler);
  }, [traveler]);

  useEffect(() => {
    safeLocalStorageSet(STORAGE_KEYS.ROLE, currentRole);
  }, [currentRole]);

  // Listen to multi-tab storage events to keep device tabs in sync with schema validation
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEYS.TRAVELER && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          setTraveler(validateTravelerProfile(parsed));
        } catch {}
      } else if (e.key === STORAGE_KEYS.STAMPS && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          setStamps(validateStampList(parsed));
        } catch {}
      } else if (e.key === STORAGE_KEYS.ROLE && e.newValue) {
        if (e.newValue === 'traveler' || e.newValue === 'guide') {
          setCurrentRole(e.newValue);
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Show temporary toast notification
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Add a new stamp into the traveler's passport with strict sanitization
  const handleStampAcquired = (newStamp: Stamp) => {
    const sanitized = validateAndSanitizeStamp(newStamp);
    if (!sanitized) {
      showToast("Error: Sello no válido o dañado.");
      return;
    }

    // Determine page placement: 2 stamps per page starting at page 1
    const targetPage = Math.floor(stamps.length / 2) + 1;
    const finalStamp: Stamp = {
      ...sanitized,
      id: sanitized.id || `stamp-${Date.now()}`,
      pageNumber: Math.min(targetPage, 8),
      stampedAtTimestamp: Date.now()
    };

    setStamps(prev => [finalStamp, ...prev]);
    showToast(`New official stamp from ${finalStamp.country} recorded on Page ${finalStamp.pageNumber}!`);
  };

  // When guide issues stamp directly
  const handleIssueDirectlyFromGuide = (stamp: Stamp) => {
    setLastGeneratedStamp(stamp);
    handleStampAcquired(stamp);
    // Switch to traveler mode automatically so they see their stamped passport
    setCurrentRole('traveler');
  };

  // Reset or Wipe stored data (Full GDPR/Privacy control)
  const handleResetData = () => {
    const confirmMsg = currentRole === 'traveler'
      ? "Reset passport stamps back to initial clean collection?"
      : "¿Deseas reiniciar los sellos a la colección limpia inicial?";
    if (confirm(confirmMsg)) {
      wipeAllStoredData();
      const freshTraveler = createInitialTraveler();
      setStamps(INITIAL_STAMPS);
      setTraveler(freshTraveler);
      showToast(currentRole === 'traveler' ? "Passport data cleared and initialized securely." : "Datos limpiados y restablecidos con seguridad.");
    }
  };

  // Unique countries count
  const uniqueCountries = new Set(stamps.map(s => s.countryCode || s.country)).size;

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col selection:bg-amber-500/30 selection:text-amber-200">
      
      {/* Top Header with Role Switcher */}
      <Header
        currentRole={currentRole}
        onRoleChange={setCurrentRole}
        stampsCount={stamps.length}
        countriesCount={uniqueCountries}
        onResetData={handleResetData}
        onOpenScanner={() => setIsScannerOpen(true)}
        onEditProfile={() => setIsEditProfileOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col justify-start sm:justify-center items-center px-1 py-1.5 sm:p-6 max-w-7xl mx-auto w-full">
        
        {currentRole === 'traveler' ? (
          /* VIAJANTE (TRAVELER) VIEW: 100% IN ENGLISH */
          <div className="w-full flex flex-col items-center">
            {/* Realistic Passport Book (Mobile Fullscreen / Desktop Spread) */}
            <PassportBook
              traveler={traveler}
              stamps={stamps}
              onSelectStamp={setSelectedStamp}
              onOpenScanner={() => setIsScannerOpen(true)}
              onEditProfile={() => setIsEditProfileOpen(true)}
            />
          </div>
        ) : (
          /* GUÍA VIEW: Generate Activity Stamp & QR Code (100% IN SPANISH) */
          <GuidePortal
            onIssueStampDirectly={handleIssueDirectlyFromGuide}
            onSwitchToTraveler={() => setCurrentRole('traveler')}
          />
        )}
      </main>

      {/* Modals */}
      <QRScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onStampAcquired={handleStampAcquired}
        lastGeneratedStamp={lastGeneratedStamp}
      />

      <StampDetailModal
        stamp={selectedStamp}
        onClose={() => setSelectedStamp(null)}
      />

      <EditTravelerModal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        profile={traveler}
        onSave={(updated) => {
          setTraveler(updated);
          showToast("Passport details updated successfully!");
        }}
      />

      {/* Toast Notification Alert */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-amber-500 text-stone-950 font-bold px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2 text-xs border border-amber-300 animate-in slide-in-from-bottom-5 duration-200">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
