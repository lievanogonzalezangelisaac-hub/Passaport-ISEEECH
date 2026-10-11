import { Stamp, TravelerProfile, StampPreset } from '../types';

export function generateRandomPassportNumber(): string {
  const letters = 'ABCDEFGHJKLMNPRSTUVWXYZ';
  const prefix = letters[Math.floor(Math.random() * letters.length)];
  const randomDigits = Math.floor(10000000 + Math.random() * 90000000);
  return `${prefix}${randomDigits}`;
}

export const createInitialTraveler = (): TravelerProfile => ({
  fullName: "",
  nationality: "MEXICAN",
  nationalityCode: "MEX",
  passportNumber: generateRandomPassportNumber(),
  language: "Spanish",
  avatarUrl: ""
});

export const INITIAL_TRAVELER: TravelerProfile = createInitialTraveler();

export const INITIAL_STAMPS: Stamp[] = [];

export const GUIDE_PRESETS: StampPreset[] = [
  {
    id: "preset-grecia",
    title: "Plantilla 1: Greece",
    country: "Greece",
    countryCode: "GRC",
    city: "",
    activityName: "Travel through Greece",
    activityCategory: "Gastronomía",
    guideName: '1° “A”',
    guideLicense: "",
    guideNotes: "",
    stampShape: "circle",
    stampColor: "navy",
    iconName: "Landmark"
  },
  {
    id: "preset-japon",
    title: "Plantilla 2: Japón",
    country: "Japan",
    countryCode: "JPN",
    city: "",
    activityName: "Travel through Japan",
    activityCategory: "Gastronomía",
    guideName: '1° “B”',
    guideLicense: "",
    guideNotes: "",
    stampShape: "shield",
    stampColor: "crimson",
    iconName: "Torii"
  },
  {
    id: "preset-italia",
    title: "Plantilla 3: Italia",
    country: "Italy",
    countryCode: "ITA",
    city: "",
    activityName: "Travel through Italy",
    activityCategory: "Gastronomía",
    guideName: '1° “C”',
    guideLicense: "",
    guideNotes: "",
    stampShape: "oval",
    stampColor: "emerald",
    iconName: "Pisa"
  },
  {
    id: "preset-espana",
    title: "Plantilla 4: España",
    country: "Spain",
    countryCode: "ESP",
    city: "",
    activityName: "Travel through Spain",
    activityCategory: "Gastronomía",
    guideName: '1° “D”',
    guideLicense: "",
    guideNotes: "",
    stampShape: "rectangle",
    stampColor: "amber",
    iconName: "Crown"
  }
];
