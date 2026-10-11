import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, ChevronRight, BookOpen, Shield, Globe, 
  Sparkles, Compass, Maximize2, Award, QrCode, Edit3,
  Smartphone, Layers, CheckCircle2, ChevronDown, Download
} from 'lucide-react';
import { Stamp, TravelerProfile } from '../types';
import { IdentityPage } from './IdentityPage';
import { PassportPageSpread } from './PassportPageSpread';
import { soundManager } from '../utils/audio';
import { exportPassportAsJPG } from '../utils/passportExport';

interface PassportBookProps {
  traveler: TravelerProfile;
  stamps: Stamp[];
  onSelectStamp: (stamp: Stamp) => void;
  onOpenScanner: () => void;
  onEditProfile?: () => void;
}

// Single-page list for mobile full-screen view
const SINGLE_PAGES = [
  { id: 'cover', title: 'Cover', label: 'Cover' },
  { id: 'notice', title: 'Notice to Bearer', label: 'Notice' },
  { id: 'identity', title: 'Traveler Biodata', label: 'Identity' },
  { id: 'page-1', title: 'Visas Page 01', label: 'Page 1', pageNum: 1 },
  { id: 'page-2', title: 'Visas Page 02', label: 'Page 2', pageNum: 2 },
  { id: 'page-3', title: 'Visas Page 03', label: 'Page 3', pageNum: 3 },
  { id: 'page-4', title: 'Visas Page 04', label: 'Page 4', pageNum: 4 },
  { id: 'page-5', title: 'Visas Page 05', label: 'Page 5', pageNum: 5 },
  { id: 'page-6', title: 'Visas Page 06', label: 'Page 6', pageNum: 6 },
  { id: 'page-7', title: 'Visas Page 07', label: 'Page 7', pageNum: 7 },
  { id: 'page-8', title: 'Visas Page 08', label: 'Page 8', pageNum: 8 },
  { id: 'back-cover', title: 'Back Cover', label: 'Back' },
];

export const PassportBook: React.FC<PassportBookProps> = ({
  traveler,
  stamps,
  onSelectStamp,
  onOpenScanner,
  onEditProfile
}) => {
  // Check if initial viewport is mobile (< 768px)
  const [isMobileScreen, setIsMobileScreen] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 768;
    }
    return true;
  });

  // Mode: 'mobile' (Single Full Page filling mobile screen) or 'spread' (Two-page desktop book)
  const [viewMode, setViewMode] = useState<'mobile' | 'spread'>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 768 ? 'mobile' : 'spread';
    }
    return 'mobile';
  });

  // Single page index for mobile mode: 0 to 11 (defaults to Identity page = 2)
  const [singlePageIndex, setSinglePageIndex] = useState<number>(2);

  // Spread index for desktop mode: 0 to 5 (defaults to Spread 1 = Notice + Identity)
  const [currentSpread, setCurrentSpread] = useState<number>(1);
  const totalSpreads = 5;

  const [flipDirection, setFlipDirection] = useState<'next' | 'prev'>('next');
  const [showPageMenu, setShowPageMenu] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportSuccess, setExportSuccess] = useState<boolean>(false);

  // Download complete passport as JPG
  const handleDownloadPassportJPG = async () => {
    if (isExporting) return;
    try {
      setIsExporting(true);
      soundManager.playSuccessChime();
      await exportPassportAsJPG(traveler, stamps);
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 3500);
    } catch (err) {
      console.error('Error downloading passport JPG:', err);
    } finally {
      setIsExporting(false);
    }
  };

  // Touch swipe handling for mobile gestures
  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);

  // Responsive resize detector
  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth < 768;
      setIsMobileScreen(isMobile);
      // Auto-switch to mobile single-page if on small screen
      if (isMobile && viewMode === 'spread') {
        setViewMode('mobile');
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [viewMode]);

  // Synchronize page index when switching modes
  const handleToggleViewMode = () => {
    if (viewMode === 'mobile') {
      // Switch to Spread view
      let targetSpread = 1;
      if (singlePageIndex === 0) targetSpread = 0;
      else if (singlePageIndex === 1 || singlePageIndex === 2) targetSpread = 1;
      else if (singlePageIndex === 3 || singlePageIndex === 4) targetSpread = 2;
      else if (singlePageIndex === 5 || singlePageIndex === 6) targetSpread = 3;
      else if (singlePageIndex === 7 || singlePageIndex === 8) targetSpread = 4;
      else targetSpread = 5;

      setCurrentSpread(targetSpread);
      setViewMode('spread');
    } else {
      // Switch to Mobile single-page view
      let targetSingle = 2;
      if (currentSpread === 0) targetSingle = 0;
      else if (currentSpread === 1) targetSingle = 2;
      else if (currentSpread === 2) targetSingle = 3;
      else if (currentSpread === 3) targetSingle = 5;
      else if (currentSpread === 4) targetSingle = 7;
      else if (currentSpread === 5) targetSingle = 9;

      setSinglePageIndex(targetSingle);
      setViewMode('mobile');
    }
    soundManager.playPageTurn();
  };

  // Next navigation
  const goToNext = () => {
    if (viewMode === 'mobile') {
      if (singlePageIndex < SINGLE_PAGES.length - 1) {
        setFlipDirection('next');
        soundManager.playPageTurn();
        setSinglePageIndex(prev => prev + 1);
      }
    } else {
      if (currentSpread < totalSpreads) {
        setFlipDirection('next');
        soundManager.playPageTurn();
        setCurrentSpread(prev => prev + 1);
      }
    }
  };

  // Prev navigation
  const goToPrev = () => {
    if (viewMode === 'mobile') {
      if (singlePageIndex > 0) {
        setFlipDirection('prev');
        soundManager.playPageTurn();
        setSinglePageIndex(prev => prev - 1);
      }
    } else {
      if (currentSpread > 0) {
        setFlipDirection('prev');
        soundManager.playPageTurn();
        setCurrentSpread(prev => prev - 1);
      }
    }
  };

  // Direct jump to single page
  const jumpToSinglePage = (index: number) => {
    if (index === singlePageIndex) return;
    setFlipDirection(index > singlePageIndex ? 'next' : 'prev');
    soundManager.playPageTurn();
    setSinglePageIndex(index);
    setShowPageMenu(false);
  };

  // Direct jump to spread
  const jumpToSpread = (index: number) => {
    if (index === currentSpread) return;
    setFlipDirection(index > currentSpread ? 'next' : 'prev');
    soundManager.playPageTurn();
    setCurrentSpread(index);
  };

  // Mobile touch swipe start
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
    touchStartYRef.current = e.touches[0].clientY;
  };

  // Mobile touch swipe end
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null || touchStartYRef.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartXRef.current;
    const deltaY = e.changedTouches[0].clientY - touchStartYRef.current;

    // Trigger only on intentional horizontal swipe (> 40px and more horizontal than vertical)
    if (Math.abs(deltaX) > 40 && Math.abs(deltaX) > Math.abs(deltaY) * 1.4) {
      if (deltaX < 0) {
        goToNext();
      } else {
        goToPrev();
      }
    }
    touchStartXRef.current = null;
    touchStartYRef.current = null;
  };

  // Count stamps on a visa page
  const getPageStampsCount = (pageNum: number) => {
    return stamps.filter(s => s.pageNumber === pageNum).length;
  };

  return (
    <div className="w-full flex flex-col items-center select-none pt-1">
      {/* =========================================================================
          MODE 1: MOBILE SINGLE-PAGE FULLSCREEN (COVERS SCREEN COMPLETELY)
         ========================================================================= */}
      {viewMode === 'mobile' ? (
        <div 
          className="w-full max-w-lg mx-auto relative px-0.5 sm:px-2 flex flex-col items-center"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Mobile Passport Card Container - Fills the mobile screen width and height */}
          <div className="w-full aspect-[1/1.42] min-h-[520px] max-h-[760px] rounded-2xl shadow-2xl relative overflow-hidden border border-stone-800/80 flex flex-col justify-between transition-all bg-[#0a1526]">
            
            <AnimatePresence mode="wait">
              <motion.div
                key={`single-page-${singlePageIndex}`}
                initial={{ 
                  opacity: 0, 
                  x: flipDirection === 'next' ? 40 : -40,
                  rotateY: flipDirection === 'next' ? 8 : -8 
                }}
                animate={{ opacity: 1, x: 0, rotateY: 0 }}
                exit={{ 
                  opacity: 0, 
                  x: flipDirection === 'next' ? -40 : 40,
                  rotateY: flipDirection === 'next' ? -8 : 8 
                }}
                transition={{ duration: 0.28, ease: [0.25, 1, 0.5, 1] }}
                className="w-full h-full flex flex-col justify-between relative overflow-hidden"
              >
                {/* PAGE 0: FRONT COVER */}
                {singlePageIndex === 0 && (
                  <div 
                    onClick={goToNext}
                    className="w-full h-full leather-texture p-6 sm:p-8 flex flex-col justify-between items-center text-center cursor-pointer relative shadow-2xl group border-l-4 border-stone-900/90"
                  >
                    {/* Gold foil decorative frames */}
                    <div className="absolute inset-3 rounded-xl border-2 gold-foil-border pointer-events-none" />
                    <div className="absolute inset-4 rounded-lg border border-amber-500/20 pointer-events-none" />

                    {/* Top Header */}
                    <div className="relative z-10 pt-3">
                      <div className="text-xs sm:text-sm font-cinzel font-black tracking-[0.25em] gold-foil-text uppercase">
                        OFFICIAL PASSPORT
                      </div>
                      <div className="text-[9px] font-cinzel tracking-[0.15em] text-amber-200/80 mt-1 uppercase">
                        GLOBAL COMMUNITY OF TRAVELERS
                      </div>
                    </div>

                    {/* Center Seal */}
                    <div className="relative z-10 my-auto flex flex-col items-center">
                      <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full border-2 border-amber-400/40 p-2 relative flex items-center justify-center shadow-lg bg-gradient-to-b from-amber-500/10 to-transparent">
                        <div className="absolute inset-1 rounded-full border border-dashed border-amber-300/30" />
                        <Globe className="w-18 h-18 sm:w-24 sm:h-24 text-amber-300 drop-shadow-[0_2px_8px_rgba(245,190,80,0.3)]" />
                        <div className="absolute -bottom-2 px-3 py-0.5 rounded-full bg-stone-900 border border-amber-400/50 text-[8px] font-cinzel font-bold gold-foil-text">
                          OFFICIAL EXPEDITION
                        </div>
                      </div>

                      <div className="mt-4 text-xs sm:text-sm font-cinzel font-bold tracking-[0.2em] gold-foil-text uppercase">
                        REPUBLIC ISEEECH
                      </div>
                    </div>

                    {/* Bottom Biometric Gold Symbol */}
                    <div className="relative z-10 w-full pb-2">
                      <div className="w-9 h-6 mx-auto rounded border border-amber-400/50 bg-amber-400/10 flex items-center justify-center mb-2">
                        <div className="w-3 h-3 rounded-full border border-amber-300/60" />
                      </div>
                      <div className="text-[10px] font-cinzel text-amber-300/80 group-hover:text-amber-200 transition-colors uppercase tracking-wider flex items-center justify-center gap-1.5">
                        <span>Tap or Swipe to Open</span>
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                )}

                {/* PAGE 1: DIPLOMATIC NOTICE TO BEARER */}
                {singlePageIndex === 1 && (
                  <div className="w-full h-full bg-[#fbf8f0] p-5 sm:p-7 flex flex-col justify-between text-stone-900 relative overflow-hidden">
                    <div className="absolute inset-0 guilloche-bg opacity-30 pointer-events-none" />

                    <div className="relative z-10 border-b-2 border-stone-800/30 pb-2.5">
                      <div className="text-xs sm:text-sm font-cinzel font-black tracking-wider uppercase text-stone-900">
                        OFFICIAL NOTICE TO BEARER
                      </div>
                      <div className="text-[8.5px] font-mrz tracking-widest text-stone-600 uppercase">
                        OFFICIAL TRAVELER DIRECTIVE • GLOBAL CONSULATE
                      </div>
                    </div>

                    <div className="relative z-10 my-auto space-y-4 text-[10px] sm:text-xs leading-relaxed text-stone-700">
                      <p className="font-serif italic border-l-2 border-amber-600/60 pl-3">
                        "All guide authorities, official hosts, and activity coordinators worldwide are hereby requested to permit the bearer of this passport free passage and to facilitate the affixing of official digital stamps upon verified completion of each adventure."
                      </p>

                      <div className="p-3.5 bg-amber-50/80 rounded-xl border border-amber-300/60 text-[9.5px] sm:text-[11px] space-y-1.5 text-stone-800 shadow-xs">
                        <div className="font-bold font-cinzel text-amber-950 flex items-center gap-1.5">
                          <Sparkles className="w-4 h-4 text-amber-700" />
                          <span>HOW TO USE YOUR PASSPORT:</span>
                        </div>
                        <p>1. Present this digital passport to your <strong>Official Guide</strong> upon completing an activity.</p>
                        <p>2. Scan the <strong>QR Code</strong> provided by the guide to collect your official stamp.</p>
                        <p>3. The stamp will be automatically recorded onto your visa pages with date and guide certification.</p>
                      </div>

                      <div className="p-2.5 rounded-lg bg-stone-200/50 border border-stone-300 text-[9px] font-mrz text-stone-700 flex items-center justify-between">
                        <span>SECURITY STANDARD: ISO-7810</span>
                        <span>OFFICIAL CERTIFIED</span>
                      </div>
                    </div>

                    <div className="relative z-10 border-t border-stone-400/50 pt-2 flex items-center justify-between text-[8.5px] font-mrz text-stone-600">
                      <span>GENERAL CONSULATE OF EXPLORERS</span>
                      <span>PAGE 00 • DOC-VER: 2026.4</span>
                    </div>
                  </div>
                )}

                {/* PAGE 2: TRAVELER IDENTIFICATION & BIODATA (FULL PHONE WIDTH & HEIGHT) */}
                {singlePageIndex === 2 && (
                  <IdentityPage
                    profile={traveler}
                    stampsCount={stamps.length}
                    onEditProfile={onEditProfile}
                  />
                )}

                {/* PAGES 3 to 10: VISA PAGES 01 THROUGH 08 */}
                {singlePageIndex >= 3 && singlePageIndex <= 10 && (
                  <PassportPageSpread
                    pageNumber={SINGLE_PAGES[singlePageIndex].pageNum!}
                    stamps={stamps}
                    onSelectStamp={onSelectStamp}
                    onOpenScanner={onOpenScanner}
                    side="single"
                  />
                )}

                {/* PAGE 11: BACK COVER */}
                {singlePageIndex === 11 && (
                  <div className="w-full h-full leather-texture p-6 sm:p-8 flex flex-col justify-between items-center text-center relative shadow-2xl border-r-4 border-stone-900/90">
                    <div className="absolute inset-3 rounded-xl border-2 gold-foil-border pointer-events-none" />
                    <div className="absolute inset-4 rounded-lg border border-amber-500/20 pointer-events-none" />

                    <div className="relative z-10 pt-4">
                      <div className="text-xs font-cinzel font-black tracking-[0.2em] gold-foil-text uppercase">
                        CONSULAR ENDORSEMENTS
                      </div>
                      <div className="text-[8.5px] font-mrz text-amber-200/70 tracking-widest mt-1 uppercase">
                        INTERNATIONAL EXPEDITION REGISTRY
                      </div>
                    </div>

                    <div className="relative z-10 my-auto flex flex-col items-center max-w-xs space-y-4">
                      <div className="w-20 h-20 rounded-full border-2 border-amber-400/40 p-2 flex items-center justify-center bg-amber-500/10 shadow-lg">
                        <Shield className="w-10 h-10 text-amber-300" />
                      </div>
                      <p className="text-[10px] sm:text-xs text-amber-200/90 leading-relaxed font-serif italic">
                        "This document is an official adventure credential. In case of lost passport, contact the nearest expedition consulate or re-issue via digital authentication."
                      </p>
                      <div className="p-2.5 rounded-lg bg-stone-950/70 border border-amber-500/30 text-[9px] font-mrz text-amber-300/80">
                        GLOBAL DISCOVERY PROTOCOL • 2026
                      </div>
                    </div>

                    <div className="relative z-10 pb-2 text-[9px] font-cinzel text-amber-300/70 uppercase tracking-widest">
                      REPUBLIC ISEEECH
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Left Edge Tap / Arrow Zone */}
            {singlePageIndex > 0 && (
              <button
                type="button"
                id="btn-mobile-left-nav"
                onClick={goToPrev}
                className="absolute left-1.5 top-1/2 -translate-y-1/2 w-8 h-12 rounded-xl bg-stone-950/60 hover:bg-stone-950/90 text-amber-300 border border-amber-500/30 flex items-center justify-center shadow-lg transition-all z-30 active:scale-90"
                title="Previous page"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}

            {/* Right Edge Tap / Arrow Zone */}
            {singlePageIndex < SINGLE_PAGES.length - 1 && (
              <button
                type="button"
                id="btn-mobile-right-nav"
                onClick={goToNext}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 w-8 h-12 rounded-xl bg-stone-950/60 hover:bg-stone-950/90 text-amber-300 border border-amber-500/30 flex items-center justify-center shadow-lg transition-all z-30 active:scale-90"
                title="Next page"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Quick Page Navigator Scrollable Strip */}
          <div className="w-full mt-3 overflow-x-auto pb-1 flex items-center gap-1.5 scrollbar-none px-1">
            {SINGLE_PAGES.map((page, idx) => {
              const isActive = idx === singlePageIndex;
              const stampsOnThisPage = page.pageNum ? getPageStampsCount(page.pageNum) : 0;
              return (
                <button
                  key={page.id}
                  onClick={() => jumpToSinglePage(idx)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium whitespace-nowrap transition-all flex items-center gap-1 shrink-0 ${
                    isActive 
                      ? 'bg-amber-500 text-stone-950 font-bold shadow-md shadow-amber-500/20' 
                      : 'bg-stone-800/80 hover:bg-stone-700 text-stone-400 hover:text-stone-200 border border-stone-700/60'
                  }`}
                >
                  <span>{page.label}</span>
                  {stampsOnThisPage > 0 && (
                    <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-stone-950' : 'bg-emerald-400'}`} />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        /* =========================================================================
            MODE 2: DESKTOP TWO-PAGE BOOK SPREAD (DOBLE PÁGINA)
           ========================================================================= */
        <div className="w-full max-w-4xl perspective-1500 py-3 px-2 sm:px-6 relative select-none">
          
          {currentSpread === 0 ? (
            /* FRONT COVER (PORTADA CERRADA) */
            <motion.div
              key="cover-spread"
              initial={{ rotateY: flipDirection === 'next' ? -40 : 40, opacity: 0 }}
              animate={{ rotateY: 0, opacity: 1 }}
              exit={{ rotateY: flipDirection === 'next' ? -90 : 90, opacity: 0 }}
              transition={{ duration: 0.5, ease: [0.25, 1, 0.5, 1] }}
              onClick={goToNext}
              className="w-full max-w-md mx-auto aspect-[1/1.4] rounded-r-2xl rounded-l-md leather-texture p-6 sm:p-8 flex flex-col justify-between items-center text-center cursor-pointer relative shadow-2xl group border-l-8 border-stone-900/90"
            >
              <div className="absolute inset-3.5 rounded-r-xl rounded-l-sm border-2 gold-foil-border pointer-events-none" />
              <div className="absolute inset-4 rounded-r-lg rounded-l-sm border border-amber-500/20 pointer-events-none" />

              <div className="relative z-10 pt-4">
                <div className="text-[11px] sm:text-[13px] font-cinzel font-black tracking-[0.25em] gold-foil-text uppercase">
                  OFFICIAL PASSPORT
                </div>
                <div className="text-[9px] font-cinzel tracking-[0.15em] text-amber-200/80 mt-1 uppercase">
                  GLOBAL COMMUNITY OF TRAVELERS
                </div>
              </div>

              <div className="relative z-10 my-auto flex flex-col items-center">
                <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full border-2 border-amber-400/40 p-2 relative flex items-center justify-center shadow-lg bg-gradient-to-b from-amber-500/10 to-transparent">
                  <div className="absolute inset-1 rounded-full border border-dashed border-amber-300/30" />
                  <Globe className="w-16 h-16 sm:w-20 sm:h-20 text-amber-300 drop-shadow-[0_2px_8px_rgba(245,190,80,0.3)]" />
                  <div className="absolute -bottom-2 px-3 py-0.5 rounded-full bg-stone-900 border border-amber-400/50 text-[8px] font-cinzel font-bold gold-foil-text">
                    OFFICIAL EXPEDITION
                  </div>
                </div>

                <div className="mt-4 text-xs font-cinzel font-bold tracking-[0.2em] gold-foil-text uppercase">
                  REPUBLIC ISEEECH
                </div>
              </div>

              <div className="relative z-10 w-full pb-2">
                <div className="w-8 h-5 mx-auto rounded border border-amber-400/50 bg-amber-400/10 flex items-center justify-center mb-2">
                  <div className="w-2.5 h-2.5 rounded-full border border-amber-300/60" />
                </div>
                <div className="text-[10px] font-cinzel text-amber-300/70 group-hover:text-amber-200 transition-colors uppercase tracking-wider flex items-center justify-center gap-1">
                  <span>Click to Open Passport</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </motion.div>
          ) : (
            /* OPENED BOOK SPREAD (DOBLE PÁGINA ABIERTA) */
            <div className="relative w-full aspect-[1.45/1] max-h-[640px] rounded-lg shadow-2xl flex preserve-3d overflow-visible">
              <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-8 z-30 pointer-events-none book-spine-shadow" />

              {/* LEFT PAGE */}
              <div className="w-1/2 h-full bg-[#fbf8f0] rounded-l-lg border-l-4 border-stone-800 shadow-xl relative overflow-hidden flex flex-col">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`left-${currentSpread}`}
                    initial={{ opacity: 0.4 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="w-full h-full"
                  >
                    {currentSpread === 1 && (
                      <div className="w-full h-full p-4 sm:p-6 flex flex-col justify-between text-stone-900 bg-[#fbf8f0] book-spine-left relative">
                        <div className="absolute inset-0 guilloche-bg opacity-30 pointer-events-none" />
                        <div className="border-b border-stone-400/50 pb-2 relative z-10">
                          <div className="text-[10px] sm:text-[12px] font-cinzel font-black tracking-wider uppercase text-stone-900">
                            OFFICIAL NOTICE TO BEARER
                          </div>
                          <div className="text-[8px] font-mrz tracking-widest text-stone-600 uppercase">
                            OFFICIAL TRAVELER DIRECTIVE
                          </div>
                        </div>

                        <div className="my-auto space-y-3 text-[9px] sm:text-[11px] leading-relaxed text-stone-700">
                          <p className="font-serif italic">
                            "All guide authorities, official hosts, and activity coordinators worldwide are hereby requested to permit the bearer of this passport free passage and to facilitate the affixing of official digital stamps upon verified completion of each adventure."
                          </p>

                          <div className="p-3 bg-amber-50/60 rounded border border-amber-200 text-[8.5px] sm:text-[10px] space-y-1 text-stone-800">
                            <div className="font-bold font-cinzel text-amber-950 flex items-center gap-1.5">
                              <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                              <span>HOW TO USE YOUR PASSPORT:</span>
                            </div>
                            <p>1. Present this digital passport to your <strong>Official Guide</strong> upon completing an activity.</p>
                            <p>2. Scan the <strong>QR Code</strong> provided by the guide to collect your official stamp.</p>
                            <p>3. The stamp will be automatically recorded onto your visa pages with date and certification.</p>
                          </div>
                        </div>

                        <div className="border-t border-stone-400/50 pt-2 flex items-center justify-between text-[8px] font-mrz text-stone-600">
                          <span>GENERAL CONSULATE OF EXPLORERS</span>
                          <span>DOC-VER: 2026.4</span>
                        </div>
                      </div>
                    )}

                    {currentSpread > 1 && (
                      <PassportPageSpread
                        pageNumber={(currentSpread - 2) * 2 + 1}
                        stamps={stamps}
                        onSelectStamp={onSelectStamp}
                        onOpenScanner={onOpenScanner}
                        side="left"
                      />
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* RIGHT PAGE */}
              <div className="w-1/2 h-full bg-[#fbf8f0] rounded-r-lg border-r-4 border-stone-800 shadow-xl relative overflow-hidden flex flex-col book-spine-right">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`right-${currentSpread}`}
                    initial={{ opacity: 0.4 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="w-full h-full"
                  >
                    {currentSpread === 1 && (
                      <IdentityPage
                        profile={traveler}
                        stampsCount={stamps.length}
                        onEditProfile={onEditProfile}
                      />
                    )}

                    {currentSpread > 1 && (
                      <PassportPageSpread
                        pageNumber={(currentSpread - 2) * 2 + 2}
                        stamps={stamps}
                        onSelectStamp={onSelectStamp}
                        onOpenScanner={onOpenScanner}
                        side="right"
                      />
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Prev button */}
              {currentSpread > 0 && (
                <button
                  id="btn-prev-page"
                  onClick={goToPrev}
                  className="absolute -left-3 sm:-left-6 md:-left-10 top-1/2 -translate-y-1/2 w-8 h-14 sm:w-10 sm:h-16 rounded-xl bg-stone-900/90 hover:bg-amber-500 text-stone-300 hover:text-stone-950 border border-stone-600/80 hover:border-amber-400 shadow-2xl flex items-center justify-center transition-all z-40 group cursor-pointer"
                  title="Previous page"
                >
                  <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 group-hover:-translate-x-0.5 transition-transform" />
                </button>
              )}

              {/* Next button */}
              {currentSpread < totalSpreads && (
                <button
                  id="btn-next-page"
                  onClick={goToNext}
                  className="absolute -right-3 sm:-right-6 md:-right-10 top-1/2 -translate-y-1/2 w-8 h-14 sm:w-10 sm:h-16 rounded-xl bg-stone-900/90 hover:bg-amber-500 text-stone-300 hover:text-stone-950 border border-stone-600/80 hover:border-amber-400 shadow-2xl flex items-center justify-center transition-all z-40 group cursor-pointer"
                  title="Next page"
                >
                  <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 group-hover:translate-x-0.5 transition-transform" />
                </button>
              )}
            </div>
          )}

          {/* Desktop Spread Navigator */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2 bg-stone-800/80 backdrop-blur-md px-4 py-2 rounded-xl border border-stone-700 text-xs text-stone-300 shadow-lg">
            <button
              onClick={goToPrev}
              disabled={currentSpread === 0}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-stone-700/60 hover:bg-stone-700 disabled:opacity-30 disabled:pointer-events-none transition-colors font-medium text-stone-200"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <button
              onClick={() => jumpToSpread(0)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                currentSpread === 0 ? 'bg-amber-500 text-stone-950 font-bold shadow' : 'hover:bg-stone-700 text-stone-400'
              }`}
            >
              Cover
            </button>

            <button
              onClick={() => jumpToSpread(1)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                currentSpread === 1 ? 'bg-amber-500 text-stone-950 font-bold shadow' : 'hover:bg-stone-700 text-stone-400'
              }`}
            >
              Identity
            </button>

            {[2, 3, 4].map(idx => {
              const p1 = (idx - 2) * 2 + 1;
              const p2 = p1 + 1;
              const hasStampsOnSpread = stamps.some(s => s.pageNumber === p1 || s.pageNumber === p2);
              return (
                <button
                  key={idx}
                  onClick={() => jumpToSpread(idx)}
                  className={`relative px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                    currentSpread === idx ? 'bg-amber-500 text-stone-950 font-bold shadow' : 'hover:bg-stone-700 text-stone-400'
                  }`}
                >
                  <span>Pages {p1}-{p2}</span>
                  {hasStampsOnSpread && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 border border-stone-800" />
                  )}
                </button>
              );
            })}

            <button
              onClick={goToNext}
              disabled={currentSpread === totalSpreads - 1}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-stone-700/60 hover:bg-stone-700 disabled:opacity-30 disabled:pointer-events-none transition-colors font-medium text-stone-200"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Global Bottom Actions Bar (Thumb-Friendly for Mobile & Desktop) */}
      <div className="mt-3 flex flex-wrap items-center justify-center gap-2 bg-stone-900/90 backdrop-blur-md px-3 sm:px-4 py-2 rounded-2xl border border-stone-800 text-xs shadow-xl w-full max-w-2xl">
        
        {/* Fill in details action */}
        {onEditProfile && (
          <button
            type="button"
            id="btn-edit-traveler-action-main"
            onClick={onEditProfile}
            className={`flex-1 min-w-[120px] flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl font-semibold shadow transition-all active:scale-95 text-xs ${
              !traveler.fullName
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 font-bold border border-amber-400'
                : 'bg-stone-800 hover:bg-stone-700 text-amber-300 border border-amber-500/30'
            }`}
            title="Fill in or edit personal traveler data"
          >
            <Edit3 className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{!traveler.fullName ? '+ Enter Your Details' : 'Edit Details'}</span>
          </button>
        )}

        {/* Scan activity QR action */}
        <button
          type="button"
          id="btn-quick-scan-action-main"
          onClick={onOpenScanner}
          className="flex-1 min-w-[120px] flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold shadow-lg shadow-amber-500/20 transition-all active:scale-95 text-xs font-cinzel tracking-wider"
        >
          <QrCode className="w-4 h-4 shrink-0" />
          <span className="truncate">Scan Activity</span>
        </button>

        {/* Download complete passport as JPG */}
        <button
          type="button"
          id="btn-download-passport-jpg"
          onClick={handleDownloadPassportJPG}
          disabled={isExporting}
          className={`flex-1 min-w-[130px] flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl font-bold shadow-lg transition-all active:scale-95 text-xs border ${
            exportSuccess
              ? 'bg-emerald-600 text-white border-emerald-400 shadow-emerald-600/30'
              : 'bg-stone-800 hover:bg-stone-700 text-amber-200 border-amber-500/40 hover:border-amber-400'
          } disabled:opacity-60 cursor-pointer`}
          title="Download complete passport as JPG image"
        >
          {isExporting ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-amber-300 border-t-transparent rounded-full animate-spin shrink-0" />
              <span className="truncate">Generating JPG...</span>
            </>
          ) : exportSuccess ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-200 shrink-0" />
              <span className="truncate">Downloaded!</span>
            </>
          ) : (
            <>
              <Download className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="truncate">Download Passport</span>
            </>
          )}
        </button>

        {/* View Mode Toggle Pill */}
        <button
          type="button"
          onClick={handleToggleViewMode}
          className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-amber-300 border border-stone-700 transition-colors shrink-0"
          title={viewMode === 'mobile' ? "Switch to Two-Page Book" : "Switch to Mobile View"}
        >
          {viewMode === 'mobile' ? <BookOpen className="w-4 h-4" /> : <Smartphone className="w-4 h-4" />}
        </button>
      </div>

    </div>
  );
};
