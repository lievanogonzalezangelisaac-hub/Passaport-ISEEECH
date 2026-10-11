import React from 'react';
import { Stamp } from '../types';
import { DigitalStamp } from './DigitalStamp';
import { QrCode, PlusCircle, Compass } from 'lucide-react';

interface PassportPageSpreadProps {
  pageNumber: number;
  stamps: Stamp[];
  onSelectStamp: (stamp: Stamp) => void;
  onOpenScanner: () => void;
  side?: 'left' | 'right' | 'single';
}

export const PassportPageSpread: React.FC<PassportPageSpreadProps> = ({
  pageNumber,
  stamps,
  onSelectStamp,
  onOpenScanner,
  side = 'single'
}) => {
  // Filter stamps for this page
  const pageStamps = stamps.filter(s => s.pageNumber === pageNumber);

  const spineClass = side === 'left' 
    ? 'book-spine-left' 
    : side === 'right' 
      ? 'book-spine-right' 
      : 'shadow-inner';

  return (
    <div className={`
      w-full h-full p-3 sm:p-5 md:p-6 flex flex-col justify-between select-none relative overflow-hidden bg-[#fbf8f0] text-stone-900
      ${spineClass}
    `}>
      {/* Background Guilloche and security print watermark - exactly identical to IdentityPage */}
      <div className="absolute inset-0 guilloche-bg opacity-30 pointer-events-none" />

      {/* Decorative center watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.04]">
        <Compass className="w-56 h-56 text-stone-900" />
      </div>

      {/* Top Header of the Page */}
      <div className="relative z-10 border-b border-stone-400/40 pb-2 flex items-center justify-between text-stone-700">
        <div className="flex items-center gap-2">
          <span className="text-[10px] sm:text-[11px] font-cinzel font-bold tracking-widest text-stone-800">
            VISAS & STAMPS
          </span>
          <span className="text-[8px] font-mrz tracking-widest text-stone-500 uppercase">
            / ENTRIES & ADMISSIONS
          </span>
        </div>
        <div className="text-[9px] sm:text-[10px] font-mrz font-extrabold px-2 py-0.5 rounded bg-stone-200/60 border border-stone-300 text-stone-800">
          PAGE {pageNumber < 10 ? `0${pageNumber}` : pageNumber}
        </div>
      </div>

      {/* Stamp Grid Area */}
      <div className="relative z-10 my-auto py-2 grid grid-cols-2 gap-2 sm:gap-4 items-center justify-items-center min-h-[300px]">
        {pageStamps.map((stamp) => (
          <div key={stamp.id} className="relative flex items-center justify-center">
            <DigitalStamp 
              stamp={stamp} 
              onClick={() => onSelectStamp(stamp)} 
            />
          </div>
        ))}

        {/* If fewer than 2 stamps on this page, render empty designated stamp slot */}
        {pageStamps.length < 2 && (
          <div 
            onClick={onOpenScanner}
            className="w-28 h-28 sm:w-32 sm:h-32 rounded-full border-2 border-dashed border-stone-400/40 hover:border-amber-600/70 bg-stone-50/20 hover:bg-amber-50/30 flex flex-col items-center justify-center p-2 text-center text-stone-500 hover:text-amber-800 transition-all cursor-pointer group"
            title="Scan new activity QR code for this slot"
          >
            <div className="p-2 rounded-full bg-stone-200/50 group-hover:bg-amber-100 group-hover:scale-110 transition-all">
              <QrCode className="w-5 h-5 text-stone-600 group-hover:text-amber-700" />
            </div>
            <span className="text-[8px] sm:text-[9px] font-cinzel font-semibold mt-1.5 uppercase tracking-wide">
              Empty Space
            </span>
            <span className="text-[7px] font-mrz text-stone-600 uppercase">
              + Scan QR
            </span>
          </div>
        )}
      </div>

      {/* Page Footer */}
      <div className="relative z-10 border-t border-stone-400/40 pt-1.5 flex items-center justify-between text-[8px] font-mrz text-stone-600">
        <span className="tracking-widest uppercase">
          REPUBLIC OF EXPLORERS
        </span>
        <span className="font-semibold">
          SEC-ID: {pageNumber * 1042}-VALID
        </span>
      </div>
    </div>
  );
};
