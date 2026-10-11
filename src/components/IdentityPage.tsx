import React, { useState } from 'react';
import { Award, Edit3, Compass, Maximize2, X, CheckCircle2, ShieldCheck } from 'lucide-react';
import { TravelerProfile } from '../types';

interface IdentityPageProps {
  profile: TravelerProfile;
  stampsCount: number;
  onEditProfile?: () => void;
}

export const IdentityPage: React.FC<IdentityPageProps> = ({ 
  profile, 
  stampsCount,
  onEditProfile 
}) => {
  const [isZoomModalOpen, setIsZoomModalOpen] = useState<boolean>(false);

  return (
    <div className="w-full h-full p-3 sm:p-5 md:p-6 flex flex-col justify-between select-none relative overflow-hidden text-stone-900 bg-[#fbf8f0]">
      {/* Subtle security paper watermark pattern - NO elements over text */}
      <div className="absolute inset-0 guilloche-bg opacity-30 pointer-events-none" />

      {/* TOP HEADER: Official Country & Document Header */}
      <div className="relative z-10 border-b-2 border-stone-800/30 pb-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-6 h-6 rounded-full border border-amber-900/50 bg-amber-100 flex items-center justify-center text-[10px] font-cinzel font-bold text-amber-950 flex-shrink-0">
              ★
            </div>
            <div className="min-w-0">
              <div className="text-[10px] sm:text-xs font-cinzel font-black tracking-widest uppercase text-stone-900 truncate">
                OFFICIAL ADVENTURE PASSPORT
              </div>
              <div className="text-[7.5px] sm:text-[8.5px] font-mrz tracking-wider text-stone-600 uppercase font-semibold">
                TRAVELER IDENTIFICATION & BIODATA
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            {/* Direct Fill In / Edit Data Button */}
            {onEditProfile && (
              <button
                type="button"
                id="btn-identity-edit-details"
                onClick={onEditProfile}
                className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold border border-amber-600 text-[8.5px] sm:text-[9.5px] transition-all hover:scale-105 shadow-xs cursor-pointer active:scale-95"
                title="Fill in or edit your personal traveler details"
              >
                <Edit3 className="w-3 h-3 text-stone-950" />
                <span className="font-mrz">EDIT</span>
              </button>
            )}

            {/* Quick Enlarge / Inspect View Button */}
            <button
              type="button"
              id="btn-identity-zoom-view"
              onClick={() => setIsZoomModalOpen(true)}
              className="p-1 rounded-md bg-stone-200 hover:bg-stone-300 text-stone-800 border border-stone-400/50 text-[9px] transition-all"
              title="View traveler data in full detail"
            >
              <Maximize2 className="w-3.5 h-3.5 text-stone-700" />
            </button>

            {/* Biometric chip symbol */}
            <div className="hidden xs:flex items-center gap-1 px-1.5 py-0.5 rounded border border-stone-400/60 bg-amber-50/70">
              <div className="w-3.5 h-2.5 rounded-[2px] border border-amber-800/70 bg-gradient-to-r from-amber-300 to-amber-200 relative flex items-center justify-center">
                <div className="w-1 h-1 border border-amber-900/70 rounded-full" />
              </div>
              <span className="text-[7.5px] font-mrz font-bold text-stone-700">ICAO</span>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN BODY: Two-column layout with 100% UNBLOCKED Traveler Biodata */}
      <div className="relative z-10 flex gap-2.5 sm:gap-4 my-auto items-stretch py-1">
        {/* Left Column: Diplomatic Watermark Seal & Official Bearer Signature */}
        <div className="w-20 sm:w-24 md:w-28 flex-shrink-0 flex flex-col items-center justify-between border-r border-stone-300/80 pr-2">
          <div 
            onClick={onEditProfile}
            className="w-full flex-1 rounded-lg border border-stone-300 bg-stone-100/90 p-1.5 shadow-xs flex flex-col items-center justify-between cursor-pointer hover:border-amber-600 transition-all group text-center"
            title="Click to edit traveler details"
          >
            <div className="my-auto flex flex-col items-center justify-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-amber-800/40 bg-amber-100/70 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                <Compass className="w-5 h-5 sm:w-6 sm:h-6 text-amber-900" />
              </div>
              <div className="text-[6.5px] sm:text-[7.5px] font-cinzel font-black text-amber-950 uppercase tracking-widest mt-1.5">
                OFFICIAL SEAL
              </div>
              <div className="text-[5.5px] sm:text-[6.5px] font-mrz font-bold text-emerald-800 uppercase flex items-center gap-0.5 mt-0.5">
                <ShieldCheck className="w-2.5 h-2.5" />
                VERIFIED
              </div>
            </div>

            <div className="w-full py-0.5 bg-amber-500/15 group-hover:bg-amber-500 group-hover:text-stone-950 rounded text-[6.5px] font-bold text-amber-900 transition-colors">
              {profile.fullName ? 'Edit Data' : '+ Add Data'}
            </div>
          </div>

          {/* Holder's Signature Box */}
          <div className="mt-1.5 text-center w-full">
            <div className="text-[6.5px] sm:text-[7.5px] font-mrz font-bold text-stone-600 uppercase tracking-wider">
              BEARER SIGNATURE
            </div>
            <div className="w-full border-b border-stone-800/40 my-0.5" />
            <div className="text-[9.5px] sm:text-[11px] italic font-serif text-stone-950 font-bold truncate">
              {profile.fullName || <span className="text-stone-400 not-italic text-[8px] font-sans font-normal">(Sign here)</span>}
            </div>
          </div>
        </div>

        {/* Right Column: Complete Biodata Fields - High Contrast & Unobstructed */}
        <div className="flex-1 min-w-0 flex flex-col justify-between space-y-1 sm:space-y-1.5">
          {/* Row 1: Document Type, Country Code, and Passport Number */}
          <div className="grid grid-cols-12 gap-1 sm:gap-2 items-center">
            <div className="col-span-3">
              <span className="text-[6.5px] sm:text-[8px] font-mrz font-bold text-stone-600 block uppercase">
                Type
              </span>
              <span className="font-extrabold font-mrz text-stone-950 text-[10px] sm:text-xs">
                P
              </span>
            </div>

            <div className="col-span-3">
              <span className="text-[6.5px] sm:text-[8px] font-mrz font-bold text-stone-600 block uppercase">
                Code
              </span>
              <span className="font-extrabold font-mrz text-stone-950 text-[10px] sm:text-xs">
                {profile.nationalityCode || '—'}
              </span>
            </div>

            <div className="col-span-6 text-right">
              <span className="text-[6.5px] sm:text-[8px] font-mrz font-bold text-stone-600 block uppercase">
                Passport No.
              </span>
              <span className="font-black font-mrz text-rose-900 text-xs sm:text-sm md:text-[15px] tracking-wider px-1.5 py-0.5 bg-rose-50 border border-rose-200 rounded inline-block">
                {profile.passportNumber || 'PENDING'}
              </span>
            </div>
          </div>

          {/* Row 2: Full Name (Surname & Given Names) - FULLY VISIBLE, NO TRUNCATE */}
          <div 
            onClick={onEditProfile}
            className="bg-stone-50/70 hover:bg-amber-50/80 p-1 sm:p-1.5 rounded border border-stone-200/80 cursor-pointer transition-colors"
            title="Click to enter your name"
          >
            <span className="text-[6.5px] sm:text-[8px] font-mrz font-bold text-stone-600 block uppercase">
              Surname &amp; Given Names
            </span>
            <span className="font-black uppercase tracking-tight text-stone-950 text-xs sm:text-sm leading-tight break-words block">
              {profile.fullName || (
                <span className="text-amber-800 font-semibold italic text-[10px] sm:text-xs flex items-center gap-1">
                  <span>+ Tap to enter your name</span>
                </span>
              )}
            </span>
          </div>

          {/* Row 3: Nationality & Language */}
          <div className="grid grid-cols-2 gap-1 sm:gap-2">
            <div>
              <span className="text-[6.5px] sm:text-[8px] font-mrz font-bold text-stone-600 block uppercase">
                Nationality
              </span>
              <span className="font-bold uppercase text-stone-950 text-[9.5px] sm:text-xs block break-words">
                {profile.nationality || 'MEXICAN'}
              </span>
            </div>
            <div>
              <span className="text-[6.5px] sm:text-[8px] font-mrz font-bold text-stone-600 block uppercase">
                Language
              </span>
              <span className="font-bold text-stone-950 text-[9.5px] sm:text-xs block">
                {profile.language || 'Spanish'}
              </span>
            </div>
          </div>

          {/* Row 4: Official Stamps Badges & Status */}
          <div className="flex flex-wrap items-center justify-between gap-1 pt-1 border-t border-stone-300/60">
            <div className="min-w-0 pr-1">
              <span className="text-[6px] sm:text-[7.5px] font-mrz font-bold text-stone-500 block uppercase">
                Bearer Status
              </span>
              <span className="text-[8.5px] sm:text-[10px] font-bold text-emerald-900 uppercase truncate block">
                OFFICIALLY REGISTERED
              </span>
            </div>

            <div className="flex items-center gap-1.5 flex-shrink-0">
              <div className="text-[8px] sm:text-[9px] font-mrz text-stone-800 font-extrabold px-1.5 py-0.5 bg-emerald-50 rounded border border-emerald-200">
                <span className="text-emerald-900">{stampsCount} stamps</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM: Machine Readable Zone (MRZ) - High Contrast & Crisp */}
      <div 
        onClick={onEditProfile}
        className="relative z-10 bg-stone-200/90 hover:bg-amber-100/60 p-1.5 sm:p-2 rounded border border-stone-300/90 font-mrz text-[8px] sm:text-[9.5px] md:text-[10px] leading-tight tracking-widest text-stone-900 font-black overflow-hidden select-all cursor-pointer transition-colors shadow-2xs"
        title="Click to fill in or update traveler details"
      >
        <div className="truncate">
          P&lt;{profile.nationalityCode || 'UTO'}{(profile.fullName || '').replace(/\s+/g, '&lt;').toUpperCase().padEnd(35, '&lt;').slice(0, 39)}
        </div>
        <div className="truncate">
          {(profile.passportNumber || '00000000').padEnd(9, '&lt;')}&lt;4{profile.nationalityCode || 'UTO'}0000000M0000000&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;00
        </div>
      </div>

      {/* ENLARGED / ZOOM MODAL: For inspecting traveler data at 100% large scale */}
      {isZoomModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#faf6eb] rounded-2xl border-4 border-amber-600/40 p-6 shadow-2xl relative text-stone-900">
            <button
              onClick={() => setIsZoomModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-stone-200 hover:bg-stone-300 text-stone-800 transition-colors"
              title="Close inspect view"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-stone-300 pb-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-amber-500/20 border border-amber-600 flex items-center justify-center">
                <Compass className="w-6 h-6 text-amber-900" />
              </div>
              <div>
                <h3 className="font-cinzel font-black text-base text-stone-950">
                  TRAVELER PASSPORT RECORD
                </h3>
                <p className="text-xs text-stone-600 font-mrz">
                  COMPLETE IDENTIFICATION DATA SHEET
                </p>
              </div>
            </div>

            <div className="space-y-3 text-sm">
              <div className="p-3 bg-white/80 rounded-xl border border-stone-300 space-y-1">
                <span className="text-xs font-mrz font-bold text-stone-500 uppercase block">
                  Full Name
                </span>
                <span className="text-lg font-black text-stone-950 uppercase block">
                  {profile.fullName || '— NOT REGISTERED —'}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="p-2.5 bg-white/80 rounded-xl border border-stone-300">
                  <span className="text-xs font-mrz font-bold text-stone-500 uppercase block">
                    Passport Number
                  </span>
                  <span className="text-base font-black text-rose-900 font-mrz">
                    {profile.passportNumber || 'PENDING'}
                  </span>
                </div>
                <div className="p-2.5 bg-white/80 rounded-xl border border-stone-300">
                  <span className="text-xs font-mrz font-bold text-stone-500 uppercase block">
                    Nationality
                  </span>
                  <span className="text-sm font-bold text-stone-950 uppercase">
                    {profile.nationality || 'MEXICAN'} ({profile.nationalityCode || 'MEX'})
                  </span>
                </div>
                <div className="p-2.5 bg-white/80 rounded-xl border border-stone-300">
                  <span className="text-xs font-mrz font-bold text-stone-500 uppercase block">
                    Language
                  </span>
                  <span className="text-sm font-bold text-stone-950 uppercase">
                    {profile.language || 'Spanish'}
                  </span>
                </div>
              </div>

              <div className="p-2.5 bg-white/80 rounded-xl border border-stone-300 flex items-center justify-between">
                <div>
                  <span className="text-xs font-mrz font-bold text-stone-500 uppercase block">
                    Official Stamps Acquired
                  </span>
                  <span className="text-xs font-bold text-emerald-900">
                    {stampsCount} {stampsCount === 1 ? 'stamp collected' : 'stamps collected'}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mrz font-bold text-stone-500 uppercase block">
                    International Standard
                  </span>
                  <span className="text-xs font-bold text-stone-900 font-mrz">
                    ICAO 9303 • CERTIFIED
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-end gap-2">
              {onEditProfile && (
                <button
                  onClick={() => {
                    setIsZoomModalOpen(false);
                    onEditProfile();
                  }}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs flex items-center gap-1.5 transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Edit Details</span>
                </button>
              )}
              <button
                onClick={() => setIsZoomModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-stone-300 hover:bg-stone-400 text-stone-900 font-bold text-xs transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
