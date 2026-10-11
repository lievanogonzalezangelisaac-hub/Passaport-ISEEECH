import React from 'react';
import { 
  Landmark, Crown, Compass, Award, CheckCircle2, ShieldCheck,
  Utensils, Mountain
} from 'lucide-react';
import { Stamp, StampColor } from '../types';

interface DigitalStampProps {
  stamp: Stamp;
  isNew?: boolean;
  onClick?: () => void;
  scale?: number;
}

// Japanese Torii Gate Emblema
export const ToriiIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5 stroke-[2.2]" }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {/* Kasagi - Top curved lintel */}
    <path d="M2 5C8 3.8 16 3.8 22 5" />
    {/* Nuki - Tie beam */}
    <path d="M4 8.5H20" />
    {/* Central strut */}
    <path d="M12 4.5V8.5" />
    {/* Pillars */}
    <path d="M7 8.5V20.5" />
    <path d="M17 8.5V20.5" />
    {/* Pillar base footings */}
    <path d="M5.5 20.5H8.5" />
    <path d="M15.5 20.5H18.5" />
  </svg>
);

// Torre de Pisa (Leaning Tower of Pisa) Emblema
export const PisaTowerIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5 stroke-[2.2]" }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {/* Ground base */}
    <path d="M3 21H19" />
    {/* Leaning tower body */}
    <path d="m6.5 21 3.5-15 7.5 1.5-3.5 15" />
    {/* Tier divisions */}
    <path d="m7.8 15.5 7.5 1.5" />
    <path d="m9 10.5 7.5 1.5" />
    {/* Bell tower top */}
    <path d="m11.5 6 1.2-2.8 4 0.8-1.2 2.8" />
  </svg>
);

export const getIconComponent = (iconName: string, customClassName?: string) => {
  const className = customClassName || "w-5 h-5 stroke-[2.2]";
  const iconProps = { className };
  switch (iconName) {
    case 'Landmark': return <Landmark {...iconProps} />;
    case 'Torii': return <ToriiIcon className={className} />;
    case 'Pisa': return <PisaTowerIcon className={className} />;
    case 'Crown': return <Crown {...iconProps} />;
    case 'Utensils': return <Utensils {...iconProps} />;
    case 'Mountain': return <Mountain {...iconProps} />;
    default: return <Landmark {...iconProps} />;
  }
};

const COLOR_THEMES: Record<StampColor, {
  border: string;
  text: string;
  subtext: string;
  bgLight: string;
  glow: string;
}> = {
  navy: {
    border: 'border-[#142850]',
    text: 'text-[#142850]',
    subtext: 'text-[#142850]/80',
    bgLight: 'bg-[#142850]/5',
    glow: 'rgba(20, 40, 80, 0.15)'
  },
  crimson: {
    border: 'border-[#8B1E1E]',
    text: 'text-[#8B1E1E]',
    subtext: 'text-[#8B1E1E]/80',
    bgLight: 'bg-[#8B1E1E]/5',
    glow: 'rgba(139, 30, 30, 0.15)'
  },
  emerald: {
    border: 'border-[#1B5E39]',
    text: 'text-[#1B5E39]',
    subtext: 'text-[#1B5E39]/80',
    bgLight: 'bg-[#1B5E39]/5',
    glow: 'rgba(27, 94, 57, 0.15)'
  },
  sepia: {
    border: 'border-[#613D21]',
    text: 'text-[#613D21]',
    subtext: 'text-[#613D21]/80',
    bgLight: 'bg-[#613D21]/5',
    glow: 'rgba(97, 61, 33, 0.15)'
  },
  violet: {
    border: 'border-[#4C1D66]',
    text: 'text-[#4C1D66]',
    subtext: 'text-[#4C1D66]/80',
    bgLight: 'bg-[#4C1D66]/5',
    glow: 'rgba(76, 29, 102, 0.15)'
  },
  amber: {
    // Amarillo dorado suave / Ocre noble (no tan estridente como el amarillo bandera)
    border: 'border-[#B27814]',
    text: 'text-[#B27814]',
    subtext: 'text-[#B27814]/85',
    bgLight: 'bg-[#B27814]/10',
    glow: 'rgba(178, 120, 20, 0.18)'
  }
};

export const DigitalStamp: React.FC<DigitalStampProps> = ({ 
  stamp, 
  isNew = false, 
  onClick,
  scale = 1 
}) => {
  const theme = COLOR_THEMES[stamp.stampColor] || COLOR_THEMES.navy;
  const rotation = stamp.stampRotation || 0;

  return (
    <div 
      id={`stamp-${stamp.id}`}
      onClick={onClick}
      style={{
        transform: `rotate(${rotation}deg) scale(${scale})`,
        transition: 'transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.25s ease'
      }}
      className={`
        relative cursor-pointer select-none group 
        p-2 transition-all duration-200
        hover:scale-105 active:scale-95
        ${isNew ? 'animate-bounce' : ''}
      `}
      title="Click to inspect activity stamp"
    >
      {/* Stamp container based on shape */}
      {renderShape(stamp, theme)}

      {/* Subtle indicator badge on hover */}
      <div className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity bg-stone-900 text-stone-100 text-[9px] px-1.5 py-0.5 rounded shadow flex items-center gap-1 pointer-events-none">
        <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
        <span>View</span>
      </div>
    </div>
  );
};

function renderShape(stamp: Stamp, theme: typeof COLOR_THEMES['navy']) {
  const icon = getIconComponent(stamp.iconName);

  switch (stamp.stampShape) {
    case 'circle':
      return (
        <div className={`
          w-32 h-32 rounded-full border-2 border-dashed ${theme.border} ${theme.text} ${theme.bgLight}
          flex flex-col items-center justify-between p-2 text-center relative
          shadow-[inset_0_0_8px_rgba(0,0,0,0.08)]
        `}>
          {/* Inner solid ring */}
          <div className={`absolute inset-1 rounded-full border ${theme.border} pointer-events-none opacity-80`} />
          
          {/* Country arc text */}
          <div className="text-[11px] font-black tracking-widest uppercase font-cinzel pt-1">
            ★ {stamp.country} ★
          </div>

          {/* Center emblem */}
          <div className="my-auto flex flex-col items-center justify-center">
            <div className="p-1 rounded-full border border-dashed border-current mb-0.5">
              {icon}
            </div>
            <div className="text-[9px] font-bold tracking-tight uppercase max-w-[95px] truncate px-1 font-sans">
              {stamp.city || stamp.activityCategory || 'GASTRONOMY'}
            </div>
            <div className="text-[8px] font-mrz font-semibold tracking-tighter opacity-90">
              {stamp.date}
            </div>
          </div>

          {/* Bottom validation code */}
          <div className="text-[7.5px] font-mrz tracking-wider pb-0.5 uppercase opacity-85">
            VISA • {stamp.verificationCode.slice(0, 10)}
          </div>
        </div>
      );

    case 'oval':
      return (
        <div className={`
          w-36 h-28 rounded-[50%/40%] border-2 ${theme.border} ${theme.text} ${theme.bgLight}
          flex flex-col items-center justify-between p-2 text-center relative
          shadow-[inset_0_0_6px_rgba(0,0,0,0.06)]
        `}>
          <div className={`absolute inset-1 rounded-[50%/40%] border border-dotted ${theme.border} pointer-events-none`} />
          <div className="text-[10px] font-black tracking-widest uppercase font-cinzel pt-0.5">
            REP. OF {stamp.country}
          </div>
          <div className="flex items-center gap-1.5 my-auto">
            {icon}
            <div className="text-left leading-tight">
              <div className="text-[9px] font-extrabold uppercase truncate max-w-[80px]">
                {stamp.city || stamp.activityCategory || 'GASTRONOMY'}
              </div>
              <div className="text-[7.5px] font-mrz font-medium">
                {stamp.date}
              </div>
            </div>
          </div>
          <div className="text-[8px] font-bold tracking-widest uppercase">
            IMMIGRATION OFFICER
          </div>
        </div>
      );

    case 'hexagon':
      return (
        <div className={`
          w-32 h-32 border-2 ${theme.border} ${theme.text} ${theme.bgLight}
          flex flex-col items-center justify-between p-2 text-center relative
          [clip-path:polygon(50%_0%,100%_25%,100%_75%,50%_100%,0%_75%,0%_25%)]
          shadow-[inset_0_0_8px_rgba(0,0,0,0.08)]
        `}>
          <div className="pt-2 text-[10px] font-black tracking-wider uppercase font-cinzel">
            {stamp.city ? `${stamp.countryCode} • ${stamp.city}` : `${stamp.countryCode} • ${stamp.activityCategory || 'GASTRONOMY'}`}
          </div>
          <div className="my-auto flex flex-col items-center">
            {icon}
            <div className="text-[8px] font-mrz font-bold mt-1">
              {stamp.date}
            </div>
          </div>
          <div className="pb-2 text-[7.5px] font-mrz tracking-tight opacity-90">
            {stamp.activityCategory.toUpperCase()}
          </div>
        </div>
      );

    case 'rectangle':
      return (
        <div className={`
          w-36 h-24 border-2 border-double ${theme.border} ${theme.text} ${theme.bgLight}
          flex flex-col items-center justify-between p-2 text-center relative
        `}>
          <div className="w-full flex justify-between items-center border-b border-current pb-0.5 text-[8px] font-bold font-mrz">
            <span>PASSPORT CONTROL</span>
            <span>{stamp.countryCode}</span>
          </div>
          <div className="flex items-center gap-2 my-auto">
            {icon}
            <div className="text-left">
              <div className="text-[10px] font-black uppercase tracking-wide">
                {stamp.city ? `${stamp.city}, ${stamp.country}` : stamp.country}
              </div>
              <div className="text-[8px] font-mrz font-bold">
                {stamp.date}
              </div>
            </div>
          </div>
          <div className="w-full text-center text-[7.5px] font-mrz border-t border-current pt-0.5">
            VERIFIED: {stamp.verificationCode}
          </div>
        </div>
      );

    case 'shield':
    default:
      return (
        <div className={`
          w-32 h-32 rounded-b-3xl border-2 ${theme.border} ${theme.text} ${theme.bgLight}
          flex flex-col items-center justify-between p-2 text-center relative
          shadow-[inset_0_0_8px_rgba(0,0,0,0.08)]
        `}>
          <div className="text-[10px] font-black tracking-widest uppercase font-cinzel pt-1 border-b border-dashed border-current w-full pb-0.5">
            {stamp.country}
          </div>
          <div className="my-auto flex flex-col items-center">
            {icon}
            <div className="text-[8.5px] font-black uppercase mt-1">
              {stamp.city}
            </div>
            <div className="text-[7.5px] font-mrz font-bold">
              {stamp.date}
            </div>
          </div>
          <div className="text-[7px] font-mrz tracking-tighter pb-1">
            OFFICIAL ADMISSION
          </div>
        </div>
      );
  }
}
