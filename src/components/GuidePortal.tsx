import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import confetti from 'canvas-confetti';
import { 
  QrCode, Sparkles, Check, Download, Copy, RefreshCw, 
  MapPin, Compass, ArrowRight, Eye, CheckCircle2, Award, 
  RotateCcw, BookmarkCheck, X
} from 'lucide-react';
import { Stamp, StampShape, StampColor, ActivityCategory, StampPreset } from '../types';
import { GUIDE_PRESETS } from '../utils/sampleData';
import { DigitalStamp, getIconComponent } from './DigitalStamp';
import { soundManager } from '../utils/audio';
import { 
  validatePresetList, 
  validateAndSanitizeStamp, 
  sanitizeText, 
  sanitizeAlphaNumeric, 
  safeLocalStorageGet, 
  safeLocalStorageSet 
} from '../utils/security';

interface GuidePortalProps {
  onIssueStampDirectly: (stamp: Stamp) => void;
  onSwitchToTraveler: () => void;
}

const STORAGE_CUSTOM_PRESETS = 'passport_guide_official_templates_v6';

// Solo los 4 iconos solicitados para las plantillas
const AVAILABLE_ICONS = [
  { name: 'Landmark', label: 'Monumento' },
  { name: 'Torii', label: 'Torii Japonés' },
  { name: 'Pisa', label: 'Torre de Pisa' },
  { name: 'Crown', label: 'Corona de Rey' },
];

const STAMP_SHAPES: { id: StampShape; label: string }[] = [
  { id: 'circle', label: 'Circular Consular' },
  { id: 'shield', label: 'Escudo de Honor' },
  { id: 'oval', label: 'Óvalo de Inmigración' },
  { id: 'rectangle', label: 'Rectángulo de Control' },
  { id: 'hexagon', label: 'Hexágono Especial' },
];

const STAMP_COLORS: { id: StampColor; label: string; bg: string }[] = [
  { id: 'navy', label: 'Azul Diplomático', bg: 'bg-blue-900' },
  { id: 'crimson', label: 'Rojo Visa', bg: 'bg-rose-900' },
  { id: 'emerald', label: 'Verde Esmeralda', bg: 'bg-emerald-800' },
  { id: 'amber', label: 'Amarillo Dorado Suave (No bandera)', bg: 'bg-amber-600' },
  { id: 'sepia', label: 'Sepia Vintage', bg: 'bg-amber-950' },
  { id: 'violet', label: 'Violeta Real', bg: 'bg-purple-900' },
];

export const GuidePortal: React.FC<GuidePortalProps> = ({
  onIssueStampDirectly,
  onSwitchToTraveler
}) => {
  // Preset activo inicial: Plantilla 1 Grecia
  const [activePresetId, setActivePresetId] = useState<string>("preset-grecia");

  // Form State inicializado con la Plantilla 1 (Grecia)
  const [country, setCountry] = useState<string>("Greece");
  const [countryCode, setCountryCode] = useState<string>("GRC");
  const [activityName, setActivityName] = useState<string>("Travel through Greece");
  const [guideName, setGuideName] = useState<string>('1° “A”');
  
  // Categoría fija y única: Gastronomía
  const category: ActivityCategory = "Gastronomía";

  // Stamp Aesthetics iniciales (Plantilla 1: circular, azul diplomático, monumento)
  const [stampShape, setStampShape] = useState<StampShape>("circle");
  const [stampColor, setStampColor] = useState<StampColor>("navy");
  const [iconName, setIconName] = useState<string>("Landmark");

  // Output QR state
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [verificationCode, setVerificationCode] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);
  const [fullScreenQR, setFullScreenQR] = useState<boolean>(false);
  const [noticeMessage, setNoticeMessage] = useState<string | null>(null);

  // Generate verification code when parameters change
  useEffect(() => {
    const randomHex = Math.random().toString(36).substring(2, 6).toUpperCase();
    const cleanCode = sanitizeAlphaNumeric(countryCode || 'INT', 4).toUpperCase();
    const code = `STMP-${cleanCode || 'INT'}-${randomHex}-OK`;
    setVerificationCode(code);
  }, [country, countryCode, activityName]);

  const cleanCountry = sanitizeText(country, 40) || 'GREECE';
  const cleanCode = sanitizeAlphaNumeric(countryCode, 4).toUpperCase() || 'GRC';
  const cleanActivity = sanitizeText(activityName, 80) || 'Travel Activity';
  const cleanGuide = sanitizeText(guideName, 50) || 'Guía Oficial';

  // Build the live stamp object with strict validation
  const liveStamp: Stamp = validateAndSanitizeStamp({
    id: `stamp-${Date.now()}`,
    country: cleanCountry.toUpperCase(),
    countryCode: cleanCode,
    city: '',
    activityName: cleanActivity,
    activityCategory: 'Gastronomía',
    date: new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase(),
    guideName: cleanGuide,
    guideLicense: '',
    guideNotes: '',
    stampShape,
    stampColor,
    iconName,
    stampRotation: Number((Math.random() * 6 - 3).toFixed(1)),
    verificationCode,
    pageNumber: 1,
    stampedAtTimestamp: Date.now()
  }) || {
    id: `stamp-${Date.now()}`,
    country: 'GREECE',
    countryCode: 'GRC',
    city: '',
    activityName: 'Travel Activity',
    activityCategory: 'Gastronomía',
    date: new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase(),
    guideName: 'Guía Oficial',
    stampShape: 'circle',
    stampColor: 'navy',
    iconName: 'Landmark',
    stampRotation: -2,
    verificationCode: 'STMP-GRC-SAMPLE-OK',
    pageNumber: 1,
    stampedAtTimestamp: Date.now()
  };

  // Generate QR Code image when stamp attributes change
  useEffect(() => {
    const payload = JSON.stringify({
      type: "PASSPORT_STAMP_PAYLOAD",
      version: "1.0",
      data: liveStamp
    });

    QRCode.toDataURL(payload, {
      width: 420,
      margin: 2,
      color: {
        dark: '#111827',
        light: '#FFFFFF'
      },
      errorCorrectionLevel: 'M'
    }).then(url => {
      setQrDataUrl(url);
    }).catch(err => {
      console.error("QR Generation error:", err);
    });
  }, [
    country, countryCode, activityName, 
    guideName, stampShape, stampColor, iconName, verificationCode
  ]);

  // Official Presets (las 4 plantillas oficiales con validación segura de almacenamiento)
  const [presets, setPresets] = useState<StampPreset[]>(() => {
    return safeLocalStorageGet(STORAGE_CUSTOM_PRESETS, validatePresetList, GUIDE_PRESETS);
  });

  // Persist presets safely to localStorage
  useEffect(() => {
    safeLocalStorageSet(STORAGE_CUSTOM_PRESETS, presets);
  }, [presets]);

  const handleSelectPreset = (preset: StampPreset) => {
    setCountry(preset.country);
    setCountryCode(preset.countryCode);
    setActivityName(preset.activityName);
    setGuideName(preset.guideName);
    setStampShape(preset.stampShape);
    setStampColor(preset.stampColor);
    setIconName(preset.iconName);
    if (preset.id) {
      setActivePresetId(preset.id);
    }
    soundManager.playPageTurn();
    setNoticeMessage(`Plantilla "${preset.title || preset.country}" seleccionada.`);
    setTimeout(() => setNoticeMessage(null), 2500);
  };

  const handleResetPresets = () => {
    setPresets(GUIDE_PRESETS);
    handleSelectPreset(GUIDE_PRESETS[0]);
    setNoticeMessage("Plantillas restablecidas a los valores originales.");
    setTimeout(() => setNoticeMessage(null), 3000);
  };

  const handleCopyPayload = () => {
    const payload = JSON.stringify({
      type: "PASSPORT_STAMP_PAYLOAD",
      data: liveStamp
    });
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(payload)
        .then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        })
        .catch(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        });
    } else {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadQR = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    const safeCode = sanitizeAlphaNumeric(countryCode || 'DEST', 6);
    const safeCountry = sanitizeAlphaNumeric(country || 'STAMP', 20);
    a.download = `QR-Sello-${safeCode}-${safeCountry}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleDirectIssue = () => {
    soundManager.playStampThud();
    soundManager.playSuccessChime();
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 }
    });
    onIssueStampDirectly(liveStamp);
  };

  return (
    <div className="w-full max-w-6xl mx-auto py-4 px-2 sm:px-6 space-y-6">
      {/* Header Banner */}
      <div className="bg-stone-800/90 border border-stone-700 rounded-2xl p-4 sm:p-5 backdrop-blur-md shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400 shrink-0">
            <Compass className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-cinzel font-bold text-amber-200">
              Portal del Guía & Emisión de Sellos
            </h2>
            <p className="text-xs text-stone-400">
              Selecciona una de las 4 plantillas oficiales en la parte superior para cargar sus parámetros automáticamente.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleResetPresets}
          title="Restablecer las 4 plantillas a los valores por defecto"
          className="px-3 py-2 rounded-xl text-xs bg-stone-700 hover:bg-stone-600 text-stone-200 font-medium transition-colors border border-stone-600 flex items-center gap-1.5"
        >
          <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
          <span>Restablecer Plantillas</span>
        </button>
      </div>

      {/* Notice Message Alert Banner */}
      {noticeMessage && (
        <div className="bg-amber-500/15 border border-amber-500/30 rounded-xl px-4 py-2.5 flex items-center justify-between text-xs text-amber-200 animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{noticeMessage}</span>
          </div>
          <button 
            type="button"
            onClick={() => setNoticeMessage(null)} 
            className="text-stone-400 hover:text-stone-200 p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 4 OFFICIAL TEMPLATES ON TOP FOR SELECTION */}
      <div className="bg-stone-800/85 border border-stone-700 rounded-2xl p-4 sm:p-5 backdrop-blur-md shadow-lg space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-stone-700/80">
          <div className="flex items-center gap-2">
            <BookmarkCheck className="w-4 h-4 text-amber-400" />
            <h3 className="text-xs font-cinzel font-bold text-stone-200 uppercase tracking-wider">
              Plantillas Disponibles para Elección
            </h3>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono font-bold border border-amber-500/30">
              4 Oficiales
            </span>
          </div>
          <span className="text-[11px] text-stone-400 hidden sm:inline">
            Haz clic en una plantilla para activarla
          </span>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {presets.map((preset, index) => {
            const isSelected = activePresetId === preset.id;
            return (
              <div
                key={preset.id || preset.country}
                id={`template-card-${index + 1}`}
                onClick={() => handleSelectPreset(preset)}
                className={`relative p-3.5 rounded-xl border cursor-pointer transition-all duration-200 flex flex-col justify-between text-left group ${
                  isSelected
                    ? 'border-amber-400 bg-amber-500/15 shadow-lg ring-2 ring-amber-400/60 scale-[1.02]'
                    : 'border-stone-700 bg-stone-900/80 hover:border-amber-500/50 hover:bg-stone-900'
                }`}
              >
                <div>
                  {/* Top Row: ISO Badge & Active status */}
                  <div className="flex items-center justify-between gap-1 mb-2">
                    <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-stone-800 text-amber-300 border border-amber-500/30">
                      {preset.countryCode}
                    </span>

                    {isSelected ? (
                      <span className="text-[10px] text-amber-400 font-bold flex items-center gap-1 bg-amber-400/20 px-2 py-0.5 rounded-full border border-amber-400/40">
                        <Check className="w-3 h-3" />
                        <span>Activa</span>
                      </span>
                    ) : (
                      <span className="text-[9.5px] text-stone-400 font-cinzel font-medium">
                        Plantilla {index + 1}
                      </span>
                    )}
                  </div>

                  {/* Title & Country */}
                  <div className="text-sm font-cinzel font-bold text-stone-100 flex items-center gap-1.5">
                    <span>{preset.country}</span>
                  </div>

                  {/* Activity Name */}
                  <div className="text-xs text-amber-200/90 font-medium truncate mt-1">
                    {preset.activityName}
                  </div>

                  {/* Guide info */}
                  <div className="text-[11px] text-stone-300 mt-1">
                    Guía: <span className="font-semibold text-stone-100">{preset.guideName}</span>
                  </div>
                </div>

                {/* Aesthetics Preview Footer */}
                <div className="mt-3 pt-2 border-t border-stone-800/90 flex items-center justify-between text-[10px] text-stone-400">
                  <div className="flex items-center gap-1.5">
                    <div className="p-1 rounded bg-stone-800 text-amber-300">
                      {getIconComponent(preset.iconName, "w-3.5 h-3.5 stroke-[2.2]")}
                    </div>
                    <span className="capitalize font-mono text-[9.5px] text-stone-300">{preset.stampShape}</span>
                  </div>

                  <span className={`w-2.5 h-2.5 rounded-full ${
                    preset.stampColor === 'navy' ? 'bg-blue-900 border border-blue-400/40' :
                    preset.stampColor === 'crimson' ? 'bg-rose-900 border border-rose-400/40' :
                    preset.stampColor === 'emerald' ? 'bg-emerald-800 border border-emerald-400/40' :
                    'bg-amber-600 border border-amber-400/40'
                  }`} title={preset.stampColor} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Grid: Form Left, Stamp & QR Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* FORM PANEL (7 cols) */}
        <div className="lg:col-span-7 bg-stone-800/70 border border-stone-700/80 rounded-2xl p-4 sm:p-6 backdrop-blur space-y-5">
          <div className="border-b border-stone-700 pb-3 flex items-center justify-between">
            <h3 className="text-sm font-cinzel font-bold text-stone-200 uppercase tracking-wider flex items-center gap-2">
              <MapPin className="w-4 h-4 text-amber-400" />
              <span>1. Información de la Actividad y Destino</span>
            </h3>
            {activePresetId && (
              <span className="text-[10px] text-amber-400 font-mono">
                Basado en plantilla activa
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label htmlFor="input-country" className="block text-xs font-medium text-stone-400 mb-1">
                País Visitado
              </label>
              <input
                id="input-country"
                name="country"
                type="text"
                maxLength={40}
                autoComplete="off"
                value={country}
                onChange={e => setCountry(e.target.value)}
                placeholder="Ej. Greece, Japan, Italy, Spain"
                className="w-full px-3 py-2 rounded-lg bg-stone-900 border border-stone-700 text-stone-100 text-sm focus:outline-none focus:border-amber-500 font-cinzel tracking-wide"
              />
            </div>

            <div>
              <label htmlFor="input-country-code" className="block text-xs font-medium text-stone-400 mb-1">
                Código ISO
              </label>
              <input
                id="input-country-code"
                name="countryCode"
                type="text"
                maxLength={4}
                autoComplete="off"
                value={countryCode}
                onChange={e => setCountryCode(e.target.value.toUpperCase())}
                placeholder="GRC"
                className="w-full px-3 py-2 rounded-lg bg-stone-900 border border-stone-700 text-stone-100 text-sm focus:outline-none focus:border-amber-500 font-mrz font-bold uppercase"
              />
            </div>
          </div>

          {/* Categoría fija y única: Gastronomía */}
          <div>
            <label className="block text-xs font-medium text-stone-400 mb-1">
              Categoría de Actividad
            </label>
            <div className="px-3.5 py-2.5 rounded-lg bg-stone-900/90 border border-amber-500/40 text-stone-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-sm shadow-amber-400/50"></span>
                <span className="font-bold text-sm text-amber-200 tracking-wide">Gastronomía</span>
              </div>
              <span className="text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 px-2.5 py-0.5 rounded border border-amber-500/30 uppercase">
                Fija y Única
              </span>
            </div>
          </div>

          <div>
            <label htmlFor="input-activity-name" className="block text-xs font-medium text-stone-400 mb-1">
              Nombre de la Actividad / Experiencia
            </label>
            <input
              id="input-activity-name"
              name="activityName"
              type="text"
              maxLength={80}
              autoComplete="off"
              value={activityName}
              onChange={e => setActivityName(e.target.value)}
              placeholder="Ej. Travel through Greece"
              className="w-full px-3 py-2 rounded-lg bg-stone-900 border border-stone-700 text-stone-100 text-sm focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label htmlFor="input-guide-name" className="block text-xs font-medium text-stone-400 mb-1">
              Nombre del Guía
            </label>
            <input
              id="input-guide-name"
              name="guideName"
              type="text"
              maxLength={50}
              autoComplete="off"
              value={guideName}
              onChange={e => setGuideName(e.target.value)}
              placeholder='Ej. 1° “A”'
              className="w-full px-3 py-2 rounded-lg bg-stone-900 border border-stone-700 text-stone-100 text-sm focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* STAMP AESTHETICS */}
          <div className="border-t border-stone-700 pt-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-cinzel font-bold text-stone-200 uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>2. Personalización de la Estampita / Sello</span>
              </h3>
            </div>

            {/* Shape selection */}
            <div>
              <label className="block text-xs font-medium text-stone-400 mb-1.5">
                Forma del Sello
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {STAMP_SHAPES.map(s => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setStampShape(s.id)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border text-left transition-all ${
                      stampShape === s.id
                        ? 'border-amber-500 bg-amber-500/15 text-amber-300 ring-1 ring-amber-400/50'
                        : 'border-stone-700 bg-stone-900/60 text-stone-400 hover:border-stone-600'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Color selection */}
            <div>
              <label className="block text-xs font-medium text-stone-400 mb-1.5">
                Color de Tinta Consular
              </label>
              <div className="flex flex-wrap gap-2">
                {STAMP_COLORS.map(c => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setStampColor(c.id)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs border transition-all ${
                      stampColor === c.id
                        ? 'border-amber-400 bg-stone-700 text-stone-100 ring-2 ring-amber-400/40'
                        : 'border-stone-700 bg-stone-900 text-stone-400 hover:border-stone-600'
                    }`}
                  >
                    <span className={`w-3 h-3 rounded-full ${c.bg}`} />
                    <span>{c.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Icon selection - Only the 4 requested icons */}
            <div>
              <label className="block text-xs font-medium text-stone-400 mb-1.5">
                Ícono / Emblema Central
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {AVAILABLE_ICONS.map(ic => (
                  <button
                    key={ic.name}
                    type="button"
                    onClick={() => setIconName(ic.name)}
                    className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                      iconName === ic.name
                        ? 'border-amber-400 bg-amber-500/15 text-amber-300 ring-2 ring-amber-400/60 shadow-md'
                        : 'border-stone-700 bg-stone-900/70 text-stone-400 hover:border-stone-600 hover:text-stone-200'
                    }`}
                    title={ic.label}
                  >
                    <div className="p-1 rounded-lg bg-stone-800/80">
                      {getIconComponent(ic.name, "w-6 h-6 stroke-[2.2]")}
                    </div>
                    <span className="text-xs font-medium truncate w-full text-center">{ic.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* PREVIEW & QR OUTPUT PANEL (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          
          {/* Live Stamp Visual Preview Box */}
          <div className="bg-stone-800/70 border border-stone-700 rounded-2xl p-4 backdrop-blur">
            <div className="flex items-center justify-between border-b border-stone-700 pb-2 mb-3">
              <span className="text-xs font-cinzel font-bold text-stone-300 uppercase tracking-wider flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-amber-400" />
                <span>Vista Previa de la Estampita</span>
              </span>
              <span className="text-[10px] font-mrz text-stone-400">
                {liveStamp.verificationCode}
              </span>
            </div>

            {/* Paper textured preview stage */}
            <div className="passport-paper-pattern rounded-xl p-4 flex items-center justify-center min-h-[160px] border border-stone-300 shadow-inner">
              <DigitalStamp stamp={liveStamp} scale={1.05} />
            </div>

            <div className="mt-2 text-center text-[10px] text-stone-400">
              Así lucirá estampado en las páginas del pasaporte del viajante.
            </div>
          </div>

          {/* Generated QR Code Card */}
          <div className="bg-stone-800/90 border border-amber-500/30 rounded-2xl p-5 backdrop-blur shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-stone-700/80 pb-2">
              <div className="flex items-center gap-1.5">
                <QrCode className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-cinzel font-bold text-amber-200 uppercase tracking-wider">
                  Código QR Oficial de Actividad
                </span>
              </div>
              <span className="text-[9px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-700/50 font-bold">
                Listo para Escanear
              </span>
            </div>

            {/* QR Code Canvas Display */}
            <div className="flex flex-col items-center">
              <div className="p-3 bg-white rounded-2xl shadow-xl border-4 border-amber-500/40 relative group">
                {qrDataUrl ? (
                  <img 
                    src={qrDataUrl} 
                    alt="QR Sello" 
                    className="w-48 h-48 sm:w-56 sm:h-56 object-contain"
                  />
                ) : (
                  <div className="w-48 h-48 flex items-center justify-center text-stone-500">
                    Generando QR...
                  </div>
                )}

                {/* Quick overlay button to expand */}
                <button
                  onClick={() => setFullScreenQR(true)}
                  className="absolute inset-0 bg-stone-950/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center text-white font-medium text-xs gap-1.5"
                >
                  <Eye className="w-4 h-4" />
                  <span>Ver en Pantalla Completa</span>
                </button>
              </div>

              <div className="mt-2 text-center">
                <div className="text-xs font-bold text-stone-200">
                  {activityName}
                </div>
                <div className="text-[11px] text-amber-400 font-mrz">
                  {country} ({countryCode}) • Gastronomía • {liveStamp.date}
                </div>
                <div className="text-[10px] text-stone-400 mt-0.5">
                  Guía: {guideName}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                id="btn-copy-payload"
                onClick={handleCopyPayload}
                className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-stone-700/80 hover:bg-stone-700 text-stone-200 text-xs font-medium border border-stone-600 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copiado' : 'Copiar Datos'}</span>
              </button>

              <button
                id="btn-download-qr"
                onClick={handleDownloadQR}
                className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-stone-700/80 hover:bg-stone-700 text-stone-200 text-xs font-medium border border-stone-600 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Descargar PNG</span>
              </button>
            </div>

            {/* PRIMARY TESTING ACTION: Issue directly to traveler passport */}
            <div className="pt-2 border-t border-stone-700 space-y-2">
              <button
                id="btn-issue-directly"
                onClick={handleDirectIssue}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold text-sm shadow-lg hover:shadow-amber-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Award className="w-4 h-4 text-stone-950" />
                <span>¡Sellar en el Pasaporte Ahora!</span>
              </button>

              <button
                onClick={onSwitchToTraveler}
                className="w-full flex items-center justify-center gap-1.5 text-xs text-amber-300/80 hover:text-amber-200 transition-colors py-1"
              >
                <span>Ir a ver el Pasaporte en Modo Viajante</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Fullscreen QR Modal */}
      {fullScreenQR && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-4">
          <div className="bg-white p-6 sm:p-8 rounded-3xl max-w-sm w-full text-center shadow-2xl flex flex-col items-center">
            <h4 className="text-stone-900 font-cinzel font-bold text-base mb-1">
              {activityName}
            </h4>
            <p className="text-stone-600 text-xs mb-4">
              {country} ({countryCode}) • Gastronomía • Escanea con tu pasaporte
            </p>

            <img 
              src={qrDataUrl} 
              alt="QR Grande" 
              className="w-64 h-64 sm:w-72 sm:h-72 object-contain"
            />

            <button
              onClick={() => setFullScreenQR(false)}
              className="mt-6 px-6 py-2 rounded-xl bg-stone-900 text-stone-100 font-semibold text-xs hover:bg-stone-800 transition-colors"
            >
              Cerrar Pantalla Completa
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
