// ============================================================================
// PPW Email Engine — List Architecture
// ============================================================================

export type ListType = "master" | "category" | "quiz" | "exclusion";

export interface ListDefinition {
  id: string;
  name: string;
  type: ListType;
  entryCriteria: string;
}

// ---------------------------------------------------------------------------
// Master Lists
// ---------------------------------------------------------------------------
const MASTER_LISTS: ListDefinition[] = [
  {
    id: "L-ALL-Master-Email",
    name: "Master Email List",
    type: "master",
    entryCriteria: "Automatic — all email signups",
  },
  {
    id: "L-ALL-Master-SMS",
    name: "Master SMS List",
    type: "master",
    entryCriteria: "Automatic — SMS consent",
  },
];

// ---------------------------------------------------------------------------
// Category-Specific Lists
// ---------------------------------------------------------------------------
const CATEGORY_LISTS: ListDefinition[] = [
  { id: "L-SAU-Subscribers", name: "Sauna Subscribers", type: "category", entryCriteria: "Popup/form on sauna pages, sauna quiz, browsed saunas" },
  { id: "L-HTR-Subscribers", name: "Sauna Heater Subscribers", type: "category", entryCriteria: "Interest in sauna heaters specifically" },
  { id: "L-CLD-Subscribers", name: "Cold Plunge Subscribers", type: "category", entryCriteria: "Cold plunge interest" },
  { id: "L-RLT-Subscribers", name: "Red Light Therapy Subscribers", type: "category", entryCriteria: "Red light therapy interest" },
  { id: "L-HYP-Subscribers", name: "Hyperbaric Subscribers", type: "category", entryCriteria: "Hyperbaric chamber interest" },
  { id: "L-H2O-Subscribers", name: "Hydrogen Water Subscribers", type: "category", entryCriteria: "Hydrogen water interest" },
  { id: "L-ION-Subscribers", name: "Water Ionizer Subscribers", type: "category", entryCriteria: "Water ionizer interest" },
  { id: "L-REC-Subscribers", name: "Recovery Subscribers", type: "category", entryCriteria: "Massage/recovery interest" },
  { id: "L-PIL-Subscribers", name: "Pilates Subscribers", type: "category", entryCriteria: "Pilates equipment interest" },
  { id: "L-GYM-Subscribers", name: "Home Gym Subscribers", type: "category", entryCriteria: "Home gym equipment interest" },
  // Add new category lists above this line
];

// ---------------------------------------------------------------------------
// Quiz Lead Lists
// ---------------------------------------------------------------------------
const QUIZ_LISTS: ListDefinition[] = [
  { id: "L-QUIZ-Sauna-Finder", name: "Sauna Finder Quiz Completers", type: "quiz", entryCriteria: "Completed sauna finder quiz" },
  { id: "L-QUIZ-Cold-Plunge", name: "Cold Plunge Quiz Completers", type: "quiz", entryCriteria: "Completed cold plunge quiz" },
  { id: "L-QUIZ-Red-Light", name: "Red Light Quiz Completers", type: "quiz", entryCriteria: "Completed red light quiz" },
  { id: "L-QUIZ-Hyperbaric", name: "Hyperbaric Quiz Completers", type: "quiz", entryCriteria: "Completed hyperbaric quiz" },
  { id: "L-QUIZ-Recovery", name: "Recovery Quiz Completers", type: "quiz", entryCriteria: "Completed general recovery quiz" },
  // Add new quiz lists above this line
];

// ---------------------------------------------------------------------------
// Exclusion Lists
// ---------------------------------------------------------------------------
const EXCLUSION_LISTS: ListDefinition[] = [
  { id: "L-EXCLUDE-Purchased", name: "Recent Purchasers", type: "exclusion", entryCriteria: "Exclude from sales emails" },
  { id: "L-EXCLUDE-Unengaged", name: "Unengaged Subscribers", type: "exclusion", entryCriteria: "No opens in 90+ days" },
  { id: "L-EXCLUDE-Complained", name: "Spam Complaints", type: "exclusion", entryCriteria: "Marked as spam" },
];

// ---------------------------------------------------------------------------
// All Lists
// ---------------------------------------------------------------------------
export const ALL_LISTS: ListDefinition[] = [
  ...MASTER_LISTS,
  ...CATEGORY_LISTS,
  ...QUIZ_LISTS,
  ...EXCLUSION_LISTS,
];

export function getListsByType(type: ListType): ListDefinition[] {
  return ALL_LISTS.filter((l) => l.type === type);
}

export function getListById(id: string): ListDefinition | undefined {
  return ALL_LISTS.find((l) => l.id === id);
}
