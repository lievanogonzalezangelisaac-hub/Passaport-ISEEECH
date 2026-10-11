export type StampShape = 'circle' | 'oval' | 'hexagon' | 'rectangle' | 'shield' | 'star';

export type StampColor = 
  | 'navy'     // Classic diplomatic indigo
  | 'crimson'  // Entry visa red
  | 'emerald'  // Ecological / forest green
  | 'sepia'    // Vintage consular brown
  | 'violet'   // Royal / ceremonial purple
  | 'amber';   // Sunset golden ochre

export type ActivityCategory = 
  | 'Cultura' 
  | 'Aventura' 
  | 'Gastronomía' 
  | 'Naturaleza' 
  | 'Historia' 
  | 'Arte';

export interface Stamp {
  id: string;
  country: string;
  countryCode: string;
  city: string;
  activityName: string;
  activityCategory: ActivityCategory;
  date: string;              // e.g. "12 SEP 2026"
  guideName: string;
  guideLicense?: string;
  guideNotes?: string;
  stampShape: StampShape;
  stampColor: StampColor;
  iconName: string;          // Icon key from Lucide or symbol
  stampRotation: number;     // -8 to 8 deg
  verificationCode: string;
  pageNumber: number;        // Page 1 to 8
  stampedAtTimestamp: number;
}

export interface TravelerProfile {
  fullName: string;
  nationality: string;
  nationalityCode: string;
  passportNumber: string;
  language: 'Spanish' | 'English';
  avatarUrl?: string;
  dateOfBirth?: string;
  issueDate?: string;
  expiryDate?: string;
  issuingAuthority?: string;
  tier?: string;
}

export interface StampPreset {
  id?: string;
  title?: string;
  country: string;
  countryCode: string;
  city: string;
  activityName: string;
  activityCategory: ActivityCategory;
  guideName: string;
  guideLicense: string;
  guideNotes: string;
  stampShape: StampShape;
  stampColor: StampColor;
  iconName: string;
}
