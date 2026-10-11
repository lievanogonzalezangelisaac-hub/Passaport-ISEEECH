import { Stamp, TravelerProfile, StampPreset, ActivityCategory, StampShape, StampColor } from '../types';
import { generateRandomPassportNumber, createInitialTraveler, GUIDE_PRESETS } from './sampleData';

/**
 * Enterprise-grade Client-Side Security Utility Suite
 * Protects against XSS, Prototype Pollution, SVG Script Injection,
 * Memory DoS, and Corrupted Storage Attacks.
 */

// Allowed sets for strict whitelisting
const VALID_CATEGORIES: ReadonlySet<ActivityCategory> = new Set([
  'Cultura', 'Aventura', 'Gastronomía', 'Naturaleza', 'Historia', 'Arte'
]);

const VALID_SHAPES: ReadonlySet<StampShape> = new Set([
  'circle', 'oval', 'hexagon', 'rectangle', 'shield', 'star'
]);

const VALID_COLORS: ReadonlySet<StampColor> = new Set([
  'navy', 'crimson', 'emerald', 'sepia', 'violet', 'amber'
]);

const VALID_LANGUAGES: ReadonlySet<'Spanish' | 'English'> = new Set([
  'Spanish', 'English'
]);

// Allowed MIME types for uploaded QR images (Strictly raster images; NO SVG/XML to prevent XSS)
export const ALLOWED_IMAGE_MIME_TYPES = Object.freeze([
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp'
]);

export const MAX_IMAGE_FILE_SIZE_BYTES = 8 * 1024 * 1024; // 8 MB max
export const MAX_QR_PAYLOAD_LENGTH = 4096; // 4 KB max string payload

/**
 * Sanitizes plain text input by stripping HTML tags, control characters,
 * dangerous unicode and script fragments, while preserving international letters (accents, ñ, etc.).
 */
export function sanitizeText(val: unknown, maxLen = 80): string {
  if (typeof val !== 'string') return '';
  return val
    // Remove HTML tags
    .replace(/<[^>]*>/g, '')
    // Remove dangerous control characters & non-printable ASCII
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, '')
    // Strip javascript: or data: prefixes that could trigger pseudo-URL exploits
    .replace(/^(?:javascript|data|vbscript):/i, '')
    .trim()
    .slice(0, maxLen);
}

/**
 * Sanitizes strictly to alphanumeric characters plus dashes/underscores (useful for IDs and Codes).
 */
export function sanitizeAlphaNumeric(val: unknown, maxLen = 20): string {
  if (typeof val !== 'string') return '';
  return val
    .replace(/[^A-Za-z0-9_-]/g, '')
    .trim()
    .slice(0, maxLen);
}

/**
 * Validates and checks if an uploaded file is a safe raster image.
 * Explicitly rejects SVGs, HTML files disguised as images, and executable extensions.
 */
export function validateUploadedImageFile(file: File | null | undefined): { safe: boolean; error?: string } {
  if (!file) {
    return { safe: false, error: 'No se seleccionó ningún archivo.' };
  }

  // 1. Check file size
  if (file.size <= 0) {
    return { safe: false, error: 'El archivo está vacío o dañado.' };
  }

  if (file.size > MAX_IMAGE_FILE_SIZE_BYTES) {
    return { 
      safe: false, 
      error: `El archivo supera el tamaño máximo permitido (${Math.round(MAX_IMAGE_FILE_SIZE_BYTES / (1024 * 1024))} MB).` 
    };
  }

  // 2. Check MIME type strictly against raster image whitelist (SVG rejected for security)
  const mime = file.type.toLowerCase();
  if (mime === 'image/svg+xml' || mime.includes('xml') || mime.includes('html')) {
    return {
      safe: false,
      error: 'Por motivos de seguridad, no se admiten imágenes vectoriales SVG ni XML. Utiliza formato PNG, JPG o WebP.'
    };
  }

  if (!ALLOWED_IMAGE_MIME_TYPES.includes(mime)) {
    return {
      safe: false,
      error: 'Formato de imagen no permitido. Por favor selecciona una imagen PNG, JPEG o WebP.'
    };
  }

  // 3. Check file extension against dangerous extensions
  const name = file.name.toLowerCase();
  const dangerousExtensions = ['.svg', '.html', '.htm', '.xml', '.php', '.exe', '.sh', '.js', '.mjs', '.bat', '.cmd'];
  for (const ext of dangerousExtensions) {
    if (name.endsWith(ext)) {
      return {
        safe: false,
        error: `Extensión de archivo "${ext}" no permitida por seguridad.`
      };
    }
  }

  return { safe: true };
}

/**
 * Deep-validates and reconstructs a Stamp object from untrusted data (QR code, localStorage, or API).
 * Prevents prototype pollution, injects safe defaults, and enforces bounded ranges.
 */
export function validateAndSanitizeStamp(raw: unknown): Stamp | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return null;
  }

  // Defend against prototype pollution
  const copy = { ...(raw as Record<string, unknown>) };
  delete copy.__proto__;
  delete copy.constructor;
  delete copy.prototype;

  const rawCountry = sanitizeText(copy.country, 40) || 'DESTINO INTERNACIONAL';
  const rawCountryCode = sanitizeAlphaNumeric(copy.countryCode, 4).toUpperCase() || 'INT';
  const rawActivityName = sanitizeText(copy.activityName, 80) || 'Actividad Registrada';

  // Category whitelist
  const categoryStr = String(copy.activityCategory || '');
  const activityCategory: ActivityCategory = VALID_CATEGORIES.has(categoryStr as ActivityCategory)
    ? (categoryStr as ActivityCategory)
    : 'Aventura';

  // Shape whitelist
  const shapeStr = String(copy.stampShape || '');
  const stampShape: StampShape = VALID_SHAPES.has(shapeStr as StampShape)
    ? (shapeStr as StampShape)
    : 'circle';

  // Color whitelist
  const colorStr = String(copy.stampColor || '');
  const stampColor: StampColor = VALID_COLORS.has(colorStr as StampColor)
    ? (colorStr as StampColor)
    : 'navy';

  // Numeric bounds on rotation (-8deg to 8deg)
  let stampRotation = -2;
  if (typeof copy.stampRotation === 'number' && !Number.isNaN(copy.stampRotation)) {
    stampRotation = Math.min(Math.max(Number(copy.stampRotation.toFixed(1)), -8), 8);
  }

  // Numeric bounds on page number (1 to 8)
  let pageNumber = 1;
  if (typeof copy.pageNumber === 'number' && !Number.isNaN(copy.pageNumber)) {
    pageNumber = Math.min(Math.max(Math.floor(copy.pageNumber), 1), 8);
  }

  // Safe timestamp
  const now = Date.now();
  let stampedAtTimestamp = now;
  if (typeof copy.stampedAtTimestamp === 'number' && copy.stampedAtTimestamp > 0 && copy.stampedAtTimestamp <= now + 86400000) {
    stampedAtTimestamp = copy.stampedAtTimestamp;
  }

  const stampId = sanitizeAlphaNumeric(copy.id, 50) || `stamp-${now}-${Math.random().toString(36).substring(2, 7)}`;
  const verificationCode = sanitizeText(copy.verificationCode, 40) || `STMP-${rawCountryCode}-${Math.random().toString(36).substring(2, 6).toUpperCase()}-OK`;

  return {
    id: stampId,
    country: rawCountry.toUpperCase(),
    countryCode: rawCountryCode,
    city: sanitizeText(copy.city, 40),
    activityName: rawActivityName,
    activityCategory,
    date: sanitizeText(copy.date, 30) || new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase(),
    guideName: sanitizeText(copy.guideName, 50) || 'Guía Oficial',
    guideLicense: sanitizeText(copy.guideLicense, 30),
    guideNotes: sanitizeText(copy.guideNotes, 160),
    stampShape,
    stampColor,
    iconName: sanitizeText(copy.iconName, 30) || 'Landmark',
    stampRotation,
    verificationCode,
    pageNumber,
    stampedAtTimestamp
  };
}

/**
 * Validates an array of stamps (e.g. from localStorage or backup import)
 */
export function validateStampList(rawList: unknown): Stamp[] {
  if (!Array.isArray(rawList)) return [];
  const safeList: Stamp[] = [];
  for (const item of rawList) {
    const validated = validateAndSanitizeStamp(item);
    if (validated) {
      safeList.push(validated);
    }
  }
  return safeList;
}

/**
 * Validates and sanitizes a TravelerProfile object
 */
export function validateTravelerProfile(raw: unknown): TravelerProfile {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return createInitialTraveler();
  }

  const copy = { ...(raw as Record<string, unknown>) };
  delete copy.__proto__;
  delete copy.constructor;
  delete copy.prototype;

  const rawName = sanitizeText(copy.fullName, 60);
  const rawPassportNumber = sanitizeAlphaNumeric(copy.passportNumber, 15).toUpperCase();

  const langStr = String(copy.language || '');
  const language: 'Spanish' | 'English' = (langStr === 'English' || langStr === 'Inglés') ? 'English' : 'Spanish';

  return {
    fullName: rawName,
    nationality: 'MEXICAN',
    nationalityCode: 'MEX',
    passportNumber: rawPassportNumber || generateRandomPassportNumber(),
    language,
    avatarUrl: ''
  };
}

/**
 * Validates StampPreset list for Guide portal
 */
export function validatePresetList(rawList: unknown): StampPreset[] {
  if (!Array.isArray(rawList) || rawList.length === 0) {
    return GUIDE_PRESETS;
  }

  const safePresets: StampPreset[] = [];
  for (const item of rawList) {
    if (!item || typeof item !== 'object') continue;
    const p = item as Record<string, unknown>;
    const shapeStr = String(p.stampShape || '');
    const colorStr = String(p.stampColor || '');

    safePresets.push({
      id: sanitizeAlphaNumeric(p.id, 40) || `preset-${Math.random().toString(36).slice(2, 6)}`,
      title: sanitizeText(p.title, 50),
      country: sanitizeText(p.country, 40) || 'Destination',
      countryCode: sanitizeAlphaNumeric(p.countryCode, 4).toUpperCase() || 'INT',
      city: sanitizeText(p.city, 40),
      activityName: sanitizeText(p.activityName, 80) || 'Activity',
      activityCategory: 'Gastronomía',
      guideName: sanitizeText(p.guideName, 50) || 'Guía',
      guideLicense: sanitizeText(p.guideLicense, 30),
      guideNotes: sanitizeText(p.guideNotes, 120),
      stampShape: VALID_SHAPES.has(shapeStr as StampShape) ? (shapeStr as StampShape) : 'circle',
      stampColor: VALID_COLORS.has(colorStr as StampColor) ? (colorStr as StampColor) : 'navy',
      iconName: sanitizeText(p.iconName, 30) || 'Landmark'
    });
  }

  return safePresets.length > 0 ? safePresets : GUIDE_PRESETS;
}

/**
 * Safely parses JSON strings with prototype pollution prevention
 */
export function safeJsonParse<T>(jsonStr: string, fallback: T): T {
  try {
    if (!jsonStr || typeof jsonStr !== 'string' || jsonStr.length > MAX_QR_PAYLOAD_LENGTH) {
      return fallback;
    }
    const parsed = JSON.parse(jsonStr);
    if (parsed && typeof parsed === 'object') {
      delete (parsed as Record<string, unknown>).__proto__;
      delete (parsed as Record<string, unknown>).constructor;
      delete (parsed as Record<string, unknown>).prototype;
    }
    return parsed as T;
  } catch {
    return fallback;
  }
}

/**
 * Secure localStorage getter with built-in validation & schema adherence
 */
export function safeLocalStorageGet<T>(key: string, validator: (raw: unknown) => T, fallback: T): T {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return fallback;
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return validator(parsed);
  } catch (err) {
    console.warn(`[Security] Safe storage read fallback for key "${key}":`, err);
    return fallback;
  }
}

/**
 * Secure localStorage setter with error handling (e.g. QuotaExceededError)
 */
export function safeLocalStorageSet(key: string, data: unknown): boolean {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return false;
    const serialized = JSON.stringify(data);
    window.localStorage.setItem(key, serialized);
    return true;
  } catch (err) {
    console.error(`[Security] Safe storage write failed for key "${key}":`, err);
    return false;
  }
}

/**
 * Complete Data Purge (GDPR / Privacy Wipe)
 * Clears all user biodata, stamps, custom presets, and temporary caches.
 */
export function wipeAllStoredData(): void {
  try {
    if (typeof window === 'undefined') return;
    const keysToRemove = [
      'passport_device_stamps_persistent_v1',
      'passport_device_traveler_persistent_v1',
      'passport_device_role_persistent_v1',
      'passport_guide_official_templates_v6',
      'passport_guide_custom_presets_v2',
      'passport_stamps_session_v1',
      'passport_traveler_session_v1',
      'passport_user_role_v1'
    ];
    for (const k of keysToRemove) {
      localStorage.removeItem(k);
      sessionStorage.removeItem(k);
    }
  } catch (err) {
    console.error('[Security] Failed to wipe stored data:', err);
  }
}
