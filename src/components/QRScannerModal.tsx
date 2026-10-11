import React, { useState, useRef, useEffect } from 'react';
import jsQR from 'jsqr';
import confetti from 'canvas-confetti';
import { 
  Camera, X, Upload, Sparkles, AlertCircle, CheckCircle2, 
  FlipHorizontal, Zap, FileText, Compass, Award
} from 'lucide-react';
import { Stamp } from '../types';
import { soundManager } from '../utils/audio';
import { GUIDE_PRESETS } from '../utils/sampleData';
import { 
  validateAndSanitizeStamp, 
  validateUploadedImageFile, 
  validatePresetList,
  sanitizeText,
  MAX_QR_PAYLOAD_LENGTH 
} from '../utils/security';

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStampAcquired: (stamp: Stamp) => void;
  lastGeneratedStamp?: Stamp | null;
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({
  isOpen,
  onClose,
  onStampAcquired,
  lastGeneratedStamp
}) => {
  const [activeTab, setActiveTab] = useState<'camera' | 'upload' | 'manual'>('camera');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [manualJson, setManualJson] = useState<string>('');
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [recentlyScanned, setRecentlyScanned] = useState<Stamp | null>(null);

  const [availablePresets, setAvailablePresets] = useState(() => {
    try {
      const saved = localStorage.getItem('passport_guide_custom_presets_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        return validatePresetList(parsed);
      }
    } catch {
      // ignore
    }
    return GUIDE_PRESETS;
  });

  useEffect(() => {
    if (isOpen) {
      try {
        const saved = localStorage.getItem('passport_guide_custom_presets_v2');
        if (saved) {
          const parsed = JSON.parse(saved);
          setAvailablePresets(validatePresetList(parsed));
          return;
        }
      } catch {
        // ignore
      }
      setAvailablePresets(GUIDE_PRESETS);
    }
  }, [isOpen]);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameId = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Helper to sanitize untrusted strings from QR or external sources
  const sanitizeText = (val: unknown, maxLen = 80): string => {
    if (typeof val !== 'string') return '';
    // Strip control characters, HTML tags, and clamp length
    return val
      .replace(/[<>]/g, '')
      .replace(/[\u0000-\u001F\u007F-\u009F]/g, '')
      .trim()
      .slice(0, maxLen);
  };

  // Stop camera stream helper
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    if (animFrameId.current) {
      cancelAnimationFrame(animFrameId.current);
      animFrameId.current = null;
    }
    setIsScanning(false);
  };

  // Start camera stream
  const startCamera = async () => {
    stopCamera();
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Your browser or device environment does not support direct camera access. Use the image upload or quick demo simulator.");
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute("playsinline", "true"); // required for iOS
        await videoRef.current.play();
        setIsScanning(true);
        requestAnimationFrame(tick);
      }
    } catch (err: unknown) {
      console.warn("Camera init warning:", err);
      const errorMsg = err instanceof Error ? err.message : String(err);
      if (errorMsg.includes("Permission denied") || errorMsg.includes("NotAllowedError")) {
        setCameraError("Camera permission was not granted. Please allow camera access, or use the 'Upload QR Image' or 'Quick Simulator' tabs.");
      } else {
        setCameraError("Camera could not be started in this environment. Use the 'Upload QR Image' or 'Quick Simulator' tabs to proceed.");
      }
      setIsScanning(false);
    }
  };

  // Camera continuous scan loop
  const tick = () => {
    if (!videoRef.current || videoRef.current.readyState !== videoRef.current.HAVE_ENOUGH_DATA) {
      animFrameId.current = requestAnimationFrame(tick);
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current || document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: "dontInvert",
      });

      if (code && code.data) {
        handleRawQRText(code.data);
        return; // Stop scanning once found
      }
    }

    animFrameId.current = requestAnimationFrame(tick);
  };

  // Process decoded QR string with security sanitization
  const handleRawQRText = (text: string) => {
    setScanError(null);
    try {
      if (!text || typeof text !== 'string') {
        throw new Error("Payload is empty or invalid.");
      }

      if (text.length > MAX_QR_PAYLOAD_LENGTH) {
        throw new Error("QR payload length exceeds maximum security limit (4 KB).");
      }

      let stampData: Stamp | null = null;

      if (text.trim().startsWith('{')) {
        try {
          const parsed = JSON.parse(text);
          if (parsed && typeof parsed === 'object') {
            const rawData = (parsed.type === "PASSPORT_STAMP_PAYLOAD" && parsed.data) 
              ? parsed.data 
              : parsed;
            stampData = validateAndSanitizeStamp(rawData);
          }
        } catch {
          // Fall through to plain text sanitization
        }
      }

      if (!stampData) {
        // Safe fallback for simple text payload
        const safeSnippet = sanitizeText(text, 60);
        stampData = validateAndSanitizeStamp({
          country: "INTERNATIONAL DESTINATION",
          countryCode: "INT",
          city: "Global Destination",
          activityName: safeSnippet || "Aventura Explorada",
          activityCategory: "Aventura",
          guideName: "Certified Guide",
          stampShape: "circle",
          stampColor: "navy",
          iconName: "Compass",
          stampRotation: -2,
        });
      }

      if (!stampData) {
        throw new Error("The QR payload could not be verified or is corrupted.");
      }

      // Success sequence
      stopCamera();
      soundManager.playStampThud();
      soundManager.playSuccessChime();
      confetti({
        particleCount: 70,
        spread: 70,
        origin: { y: 0.6 }
      });

      setRecentlyScanned(stampData);
      onStampAcquired(stampData);
    } catch (err) {
      console.warn("QR decode validation error:", err);
      const msg = err instanceof Error ? err.message : "The QR code payload is invalid or could not be verified securely. Please check with your tour guide.";
      setScanError(msg);
    }
  };

  // Secure file image upload handler (Strictly raster formats, rejects SVGs/scripts, uses memory-safe ObjectURLs)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setScanError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    // Strict security check: reject SVGs, XML, non-raster formats, oversized files
    const validation = validateUploadedImageFile(file);
    if (!validation.safe) {
      setScanError(validation.error || "Archivo no admitido por motivos de seguridad.");
      e.target.value = '';
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    const cleanup = () => {
      try {
        URL.revokeObjectURL(objectUrl);
      } catch {}
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };

    img.onerror = () => {
      cleanup();
      setScanError("No se pudo procesar la imagen seleccionada. Comprueba que el archivo no esté dañado.");
    };

    img.onload = () => {
      try {
        const maxDim = 2048;
        let width = img.width;
        let height = img.height;

        if (width <= 0 || height <= 0) {
          throw new Error("Dimensiones de imagen inválidas.");
        }

        if (width > maxDim || height > maxDim) {
          const ratio = Math.min(maxDim / width, maxDim / height);
          width = Math.max(1, Math.round(width * ratio));
          height = Math.max(1, Math.round(height * ratio));
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) {
          throw new Error("No se pudo inicializar el contexto de imagen.");
        }

        ctx.drawImage(img, 0, 0, width, height);
        const imgData = ctx.getImageData(0, 0, width, height);
        const code = jsQR(imgData.data, imgData.width, imgData.height);
        
        cleanup();

        if (code && code.data) {
          handleRawQRText(code.data);
        } else {
          setScanError("No se detectó ningún código QR en la imagen. Asegúrate de que el código QR sea legible y tenga buena iluminación.");
        }
      } catch (err) {
        cleanup();
        console.warn("Error processing image canvas:", err);
        setScanError("Error al procesar la imagen para decodificar el código QR.");
      }
    };

    img.src = objectUrl;
  };

  // Quick Demo Simulator
  const handleQuickDemoScan = (presetIndex: number) => {
    const preset = availablePresets[presetIndex] || GUIDE_PRESETS[0];
    if (!preset) return;
    const newStamp: Stamp = {
      id: `stamp-${Date.now()}-${preset.countryCode}`,
      country: preset.country,
      countryCode: preset.countryCode,
      city: preset.city,
      activityName: preset.activityName,
      activityCategory: preset.activityCategory,
      date: new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase(),
      guideName: preset.guideName,
      guideLicense: preset.guideLicense,
      guideNotes: preset.guideNotes,
      stampShape: preset.stampShape,
      stampColor: preset.stampColor,
      iconName: preset.iconName,
      stampRotation: Number((Math.random() * 6 - 3).toFixed(1)),
      verificationCode: `STMP-${preset.countryCode}-${Math.random().toString(36).substring(2, 6).toUpperCase()}-OK`,
      pageNumber: 1,
      stampedAtTimestamp: Date.now()
    };
    handleRawQRText(JSON.stringify({ type: "PASSPORT_STAMP_PAYLOAD", data: newStamp }));
  };

  // Lifecycle when open
  useEffect(() => {
    if (isOpen && activeTab === 'camera') {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, activeTab, facingMode]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-stone-900 border border-stone-700 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl flex flex-col text-stone-100">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-cinzel font-bold text-amber-200">
                Scan Activity QR Code
              </h3>
              <p className="text-[11px] text-stone-400">
                Point at the QR code provided by your tour guide to collect your official stamp
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="p-1.5 rounded-full hover:bg-stone-800 text-stone-400 hover:text-stone-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-stone-800 px-5 pt-2 gap-2 text-xs">
          <button
            onClick={() => setActiveTab('camera')}
            className={`pb-2 px-2 border-b-2 font-medium transition-colors ${
              activeTab === 'camera'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            Live Camera
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`pb-2 px-2 border-b-2 font-medium transition-colors ${
              activeTab === 'upload'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            Upload QR Image
          </button>
          <button
            onClick={() => setActiveTab('manual')}
            className={`pb-2 px-2 border-b-2 font-medium transition-colors ${
              activeTab === 'manual'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            Quick Simulator
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-5 flex-1 flex flex-col justify-center">
          {/* Security Alert Banner for Scan / Upload errors */}
          {scanError && (
            <div className="mb-4 p-3 rounded-xl bg-rose-950/80 border border-rose-600/70 text-rose-200 text-xs flex items-start justify-between gap-2 shadow-lg animate-in fade-in duration-150">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span className="leading-snug">{scanError}</span>
              </div>
              <button
                type="button"
                onClick={() => setScanError(null)}
                className="p-1 rounded-md hover:bg-rose-900/60 text-rose-300 hover:text-white transition-colors"
                title="Dismiss alert"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
          
          {/* CAMERA TAB */}
          {activeTab === 'camera' && (
            <div className="space-y-4">
              {cameraError ? (
                <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-800/60 text-amber-200 text-xs space-y-2">
                  <div className="flex items-center gap-2 font-semibold">
                    <AlertCircle className="w-4 h-4 text-amber-400" />
                    <span>Camera not available in this environment</span>
                  </div>
                  <p className="text-[11px] text-amber-300/80">
                    {cameraError}
                  </p>
                  <div className="pt-2 flex gap-2">
                    <button
                      onClick={() => setActiveTab('manual')}
                      className="px-3 py-1.5 rounded-lg bg-amber-500 text-stone-950 font-bold text-xs hover:bg-amber-400 transition-colors"
                    >
                      Use Quick Test Stamps
                    </button>
                    <button
                      onClick={() => setActiveTab('upload')}
                      className="px-3 py-1.5 rounded-lg bg-stone-800 text-stone-200 text-xs hover:bg-stone-700 transition-colors"
                    >
                      Upload Image
                    </button>
                  </div>
                </div>
              ) : (
                <div className="relative aspect-square max-w-[280px] sm:max-w-[320px] mx-auto rounded-2xl overflow-hidden bg-black border-2 border-stone-700 shadow-inner flex items-center justify-center">
                  <video
                    ref={videoRef}
                    className="w-full h-full object-cover"
                    muted
                  />
                  <canvas ref={canvasRef} className="hidden" />

                  {/* Viewfinder Target overlay */}
                  <div className="absolute inset-8 border-2 border-amber-400/70 rounded-xl pointer-events-none flex flex-col justify-between p-2 shadow-[0_0_15px_rgba(245,190,80,0.2)]">
                    {/* Laser scanning line animation */}
                    <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent animate-pulse" />
                    <div className="text-[10px] font-cinzel text-amber-300 text-center uppercase tracking-widest bg-stone-900/80 py-0.5 px-2 rounded-full self-center">
                      Align QR Code Here
                    </div>
                  </div>

                  {/* Switch camera button */}
                  <button
                    onClick={() => setFacingMode(prev => prev === 'environment' ? 'user' : 'environment')}
                    className="absolute bottom-3 right-3 p-2 rounded-full bg-stone-900/80 text-stone-300 hover:text-white border border-stone-700"
                    title="Flip camera"
                  >
                    <FlipHorizontal className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Instant shortcut to scan the guide's currently generated QR */}
              {lastGeneratedStamp && (
                <div className="p-3 rounded-xl bg-stone-800/80 border border-amber-500/30 flex items-center justify-between">
                  <div className="text-left">
                    <div className="text-[11px] font-bold text-amber-300 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-400" />
                      <span>Active guide stamp available:</span>
                    </div>
                    <div className="text-xs text-stone-200">
                      {lastGeneratedStamp.activityName} ({lastGeneratedStamp.city})
                    </div>
                  </div>
                  <button
                    onClick={() => handleRawQRText(JSON.stringify({ type: "PASSPORT_STAMP_PAYLOAD", data: lastGeneratedStamp }))}
                    className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs transition-colors"
                  >
                    Scan This
                  </button>
                </div>
              )}
            </div>
          )}

          {/* UPLOAD TAB */}
          {activeTab === 'upload' && (
            <div className="space-y-4 py-2">
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-stone-700 hover:border-amber-500/70 rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-stone-950/40 group"
              >
                <div className="p-3 rounded-full bg-stone-800 group-hover:bg-amber-500/20 text-stone-400 group-hover:text-amber-400 transition-colors mb-3">
                  <Upload className="w-8 h-8" />
                </div>
                <div className="text-sm font-semibold text-stone-200 mb-1">
                  Upload a photo or screenshot of the QR Code
                </div>
                <p className="text-xs text-stone-400 max-w-xs">
                  Click or drag and drop a PNG or JPG file with the QR code generated by the guide.
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
            </div>
          )}

          {/* MANUAL / DEMO SIMULATOR TAB */}
          {activeTab === 'manual' && (
            <div className="space-y-4">
              <div>
                <span className="text-xs font-cinzel font-bold text-stone-300 uppercase tracking-wider block mb-2">
                  Select an activity to simulate QR scan:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
                  {availablePresets.map((preset, idx) => (
                    <button
                      key={preset.id || idx}
                      onClick={() => handleQuickDemoScan(idx)}
                      className="p-2.5 rounded-xl border border-stone-700 bg-stone-800/60 hover:bg-amber-500/15 hover:border-amber-500 text-left transition-all group"
                    >
                      <div className="text-xs font-bold text-amber-200 group-hover:text-amber-100 flex items-center justify-between">
                        <span>{preset.country}</span>
                        <span className="text-[10px] font-mrz text-stone-400">{preset.countryCode}</span>
                      </div>
                      <div className="text-xs text-stone-300 truncate">
                        {preset.title || preset.activityName}
                      </div>
                      <div className="text-[10px] text-stone-400 mt-1">
                        Guide: {preset.guideName}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Paste JSON */}
              <div className="pt-2 border-t border-stone-800">
                <label className="block text-[11px] text-stone-400 mb-1">
                  Or paste the stamp JSON payload directly:
                </label>
                <div className="flex gap-2">
                  <input
                    id="input-manual-json-payload"
                    name="manualJsonPayload"
                    type="text"
                    value={manualJson}
                    onChange={e => setManualJson(e.target.value)}
                    maxLength={2000}
                    autoComplete="off"
                    spellCheck="false"
                    placeholder='{"type":"PASSPORT_STAMP_PAYLOAD"...}'
                    className="flex-1 px-3 py-1.5 rounded-lg bg-stone-950 border border-stone-700 text-xs text-stone-200 focus:outline-none focus:border-amber-500 font-mono"
                  />
                  <button
                    onClick={() => {
                      if (manualJson.trim()) {
                        handleRawQRText(manualJson);
                      }
                    }}
                    className="px-3 py-1.5 rounded-lg bg-stone-700 hover:bg-stone-600 text-xs font-semibold"
                  >
                    Process
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Recently Scanned celebration badge */}
          {recentlyScanned && (
            <div className="mt-4 p-3 rounded-xl bg-emerald-950/60 border border-emerald-600/50 text-emerald-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <div className="text-xs">
                  <span className="font-bold">Official stamp from {recentlyScanned.country} added!</span>
                  <div className="text-[11px] text-emerald-300/80 truncate max-w-xs">
                    {recentlyScanned.activityName} • Saved to your passport
                  </div>
                </div>
              </div>
              <button
                onClick={onClose}
                className="px-3 py-1 rounded-lg bg-emerald-500 text-stone-950 font-bold text-xs hover:bg-emerald-400 transition-colors shrink-0"
              >
                View Passport
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
