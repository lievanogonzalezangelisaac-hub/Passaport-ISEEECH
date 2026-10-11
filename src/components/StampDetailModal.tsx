import React, { useState } from 'react';
import { 
  X, MapPin, Calendar, Award, ShieldCheck, User, 
  FileText, Check, Copy, Sparkles, Compass
} from 'lucide-react';
import { Stamp } from '../types';
import { DigitalStamp } from './DigitalStamp';

interface StampDetailModalProps {
  stamp: Stamp | null;
  onClose: () => void;
  onDeleteStamp?: (stampId: string) => void;
}

export const StampDetailModal: React.FC<StampDetailModalProps> = ({
  stamp,
  onClose,
  onDeleteStamp
}) => {
  const [copied, setCopied] = useState<boolean>(false);

  if (!stamp) return null;

  const handleCopyCertificate = () => {
    const destinationText = stamp.city ? `${stamp.city}, ${stamp.country}` : stamp.country;
    const text = `🏆 INTERNATIONAL ACTIVITY CERTIFICATE\nCountry: ${stamp.country} (${stamp.countryCode})\nDestination: ${destinationText}\nActivity: ${stamp.activityName}\nCategory: ${stamp.activityCategory}\nDate: ${stamp.date}\nGuide: ${stamp.guideName}${stamp.guideLicense ? ` (${stamp.guideLicense})` : ''}\nOfficial Verification Code: ${stamp.verificationCode}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-stone-900 border border-stone-700 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl flex flex-col text-stone-100">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-cinzel font-bold text-amber-200 uppercase tracking-wider">
                Official Stamp Inspection
              </h3>
              <p className="text-[10px] font-mrz text-stone-400">
                CONSULAR REGISTRY • PAGE {stamp.pageNumber < 10 ? `0${stamp.pageNumber}` : stamp.pageNumber}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-stone-800 text-stone-400 hover:text-stone-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4">
          
          {/* Visual Stamp Card on Paper background */}
          <div className="passport-paper-pattern rounded-2xl p-6 flex flex-col items-center justify-center border border-stone-400/40 shadow-inner relative overflow-hidden">
            <div className="absolute inset-0 guilloche-bg opacity-30 pointer-events-none" />
            <DigitalStamp stamp={stamp} scale={1.2} />
          </div>

          {/* Details list */}
          <div className="bg-stone-800/60 rounded-2xl p-4 border border-stone-700/60 space-y-2.5 text-xs">
            <div className="flex items-start justify-between border-b border-stone-700/60 pb-2">
              <div>
                <span className="text-[10px] text-stone-400 font-mrz uppercase block">Completed Activity</span>
                <span className="font-bold text-sm text-stone-100">{stamp.activityName}</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-semibold text-[10px] border border-amber-500/30">
                {stamp.activityCategory}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 border-b border-stone-700/60 pb-2">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
                <div>
                  <span className="text-[10px] text-stone-400 font-mrz uppercase block">Destination</span>
                  <span className="font-semibold text-stone-200">{stamp.city ? `${stamp.city}, ${stamp.country}` : stamp.country}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber-400 shrink-0" />
                <div>
                  <span className="text-[10px] text-stone-400 font-mrz uppercase block">Date</span>
                  <span className="font-semibold text-stone-200">{stamp.date}</span>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-2 border-b border-stone-700/60 pb-2">
              <User className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] text-stone-400 font-mrz uppercase block">Certified Official Guide</span>
                <span className="font-semibold text-stone-200">{stamp.guideName}</span>
                {stamp.guideLicense && (
                  <span className="text-[10px] font-mrz text-stone-400 block">Lic. {stamp.guideLicense}</span>
                )}
              </div>
            </div>

            {stamp.guideNotes && (
              <div className="bg-stone-900/50 p-2.5 rounded-xl border border-stone-700/50 text-[11px] text-stone-300 italic">
                "{stamp.guideNotes}"
              </div>
            )}

            <div className="flex items-center justify-between pt-1">
              <span className="text-[10px] text-stone-400 font-mrz uppercase">Verification Code:</span>
              <span className="font-mrz font-bold text-amber-400 text-xs">{stamp.verificationCode}</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleCopyCertificate}
              className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs transition-colors shadow"
            >
              {copied ? <Check className="w-4 h-4 text-stone-950" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied to Clipboard' : 'Copy Certificate'}</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
