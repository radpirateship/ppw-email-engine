// ============================================================================
// PPW Email Engine — Category System
// ============================================================================

export interface Category {
  code: string;
  name: string;
  fullName: string;
  keyProducts: string[];
  articleCount: number;
  hasQuiz: boolean;
  tagSlug: string;
}

export const CATEGORIES: Record<string, Category> = {
  SAU: {
    code: "SAU",
    name: "Saunas",
    fullName: "Saunas",
    keyProducts: ["Infrared", "Barrel", "Indoor", "Outdoor"],
    articleCount: 80,
    hasQuiz: true,
    tagSlug: "saunas",
  },
  HTR: {
    code: "HTR",
    name: "Sauna Heaters",
    fullName: "Sauna Heaters",
    keyProducts: ["Electric", "Wood-Burning", "Accessories"],
    articleCount: 10,
    hasQuiz: false,
    tagSlug: "sauna-heaters",
  },
  CLD: {
    code: "CLD",
    name: "Cold Plunges",
    fullName: "Cold Plunges",
    keyProducts: ["Ice Baths", "Chillers"],
    articleCount: 51,
    hasQuiz: true,
    tagSlug: "cold-plunges",
  },
  RLT: {
    code: "RLT",
    name: "Red Light Therapy",
    fullName: "Red Light Therapy",
    keyProducts: ["Panels", "Devices", "Masks"],
    articleCount: 41,
    hasQuiz: true,
    tagSlug: "red-light-therapy",
  },
  HYP: {
    code: "HYP",
    name: "Hyperbaric",
    fullName: "Hyperbaric Chambers",
    keyProducts: ["Chambers", "Accessories"],
    articleCount: 39,
    hasQuiz: true,
    tagSlug: "hyperbaric",
  },
  H2O: {
    code: "H2O",
    name: "Hydrogen Water",
    fullName: "Hydrogen Water",
    keyProducts: ["Machines", "Bottles"],
    articleCount: 31,
    hasQuiz: true,
    tagSlug: "hydrogen-water",
  },
  ION: {
    code: "ION",
    name: "Water Ionizers",
    fullName: "Water Ionizers",
    keyProducts: ["Countertop", "Under-sink"],
    articleCount: 26,
    hasQuiz: false,
    tagSlug: "water-ionizers",
  },
  REC: {
    code: "REC",
    name: "Massage & Recovery",
    fullName: "Massage & Recovery",
    keyProducts: ["Massage Chairs", "Guns", "Compression"],
    articleCount: 25,
    hasQuiz: true,
    tagSlug: "massage-recovery",
  },
  SDT: {
    code: "SDT",
    name: "Float Tanks",
    fullName: "Sensory Deprivation Tanks",
    keyProducts: ["Float Tanks"],
    articleCount: 10,
    hasQuiz: false,
    tagSlug: "float-tanks",
  },
  PIL: {
    code: "PIL",
    name: "Pilates",
    fullName: "Pilates Equipment",
    keyProducts: ["Reformers", "Chairs", "Equipment"],
    articleCount: 15,
    hasQuiz: true,
    tagSlug: "pilates",
  },
  GYM: {
    code: "GYM",
    name: "Home Gym",
    fullName: "Home Gym Equipment",
    keyProducts: ["Strength Equipment", "Racks", "Benches"],
    articleCount: 20,
    hasQuiz: true,
    tagSlug: "home-gym",
  },
  CRD: {
    code: "CRD",
    name: "Cardio",
    fullName: "Cardio Equipment",
    keyProducts: ["Bikes", "Treadmills", "Climbers"],
    articleCount: 15,
    hasQuiz: false,
    tagSlug: "cardio",
  },
  SPT: {
    code: "SPT",
    name: "Sports",
    fullName: "Sports Equipment",
    keyProducts: ["Lacrosse", "Athlete Management"],
    articleCount: 5,
    hasQuiz: false,
    tagSlug: "sports",
  },
  WEL: {
    code: "WEL",
    name: "Home Wellness",
    fullName: "Home Wellness",
    keyProducts: ["Air Purifiers", "Steam", "PEMF"],
    articleCount: 15,
    hasQuiz: false,
    tagSlug: "home-wellness",
  },
  // Add new categories above this line
} as const;

export const CATEGORY_CODES = Object.keys(CATEGORIES) as Array<
  keyof typeof CATEGORIES
>;

export const QUIZ_CATEGORIES = CATEGORY_CODES.filter(
  (code) => CATEGORIES[code].hasQuiz
);

export const TOTAL_ARTICLES = Object.values(CATEGORIES).reduce(
  (sum, cat) => sum + cat.articleCount,
  0
);
