// ============================================================================
// PPW Email Engine — Flow Architecture
// ============================================================================

export type FlowCategory = "entry" | "engagement" | "post-purchase" | "lifecycle";
export type FlowStatus = "planned" | "draft" | "built" | "live";

export interface FlowEmail {
  position: string;
  day: number;
  subject?: string;
  contentType: string;
  purpose: string;
}

export interface FlowDefinition {
  id: string;
  name: string;
  category: FlowCategory;
  trigger: string;
  emailCount: number;
  tieredByPrice: boolean;
  description: string;
  status: FlowStatus;
  emails?: FlowEmail[];
}

// ---------------------------------------------------------------------------
// Entry Flows
// ---------------------------------------------------------------------------
const ENTRY_FLOWS: FlowDefinition[] = [
  {
    id: "F-ALL-Welcome-Popup",
    name: "Welcome — Popup",
    category: "entry",
    trigger: "Subscribes to master list via popup",
    emailCount: 3,
    tieredByPrice: false,
    description: "Introduce brand, identify category interest",
    status: "planned",
    emails: [
      { position: "E1", day: 0, contentType: "welcome", purpose: "Brand story + value prop + category overview" },
      { position: "E2", day: 2, contentType: "discovery", purpose: "Showcase top 3 categories with links" },
      { position: "E3", day: 4, contentType: "social-proof", purpose: "Testimonials + consultation offer" },
    ],
  },
  {
    id: "F-SAU-Welcome-Quiz",
    name: "Sauna Quiz Nurture",
    category: "entry",
    trigger: "Completed sauna finder quiz",
    emailCount: 11,
    tieredByPrice: false,
    description: "45-day nurture: educate, build trust, convert",
    status: "planned",
  },
  {
    id: "F-CLD-Welcome-Quiz",
    name: "Cold Plunge Quiz Nurture",
    category: "entry",
    trigger: "Completed cold plunge quiz",
    emailCount: 11,
    tieredByPrice: false,
    description: "45-day nurture: educate, build trust, convert",
    status: "planned",
  },
  {
    id: "F-RLT-Welcome-Quiz",
    name: "Red Light Quiz Nurture",
    category: "entry",
    trigger: "Completed red light quiz",
    emailCount: 11,
    tieredByPrice: false,
    description: "45-day nurture: educate, build trust, convert",
    status: "planned",
  },
  {
    id: "F-HYP-Welcome-Quiz",
    name: "Hyperbaric Quiz Nurture",
    category: "entry",
    trigger: "Completed hyperbaric quiz",
    emailCount: 11,
    tieredByPrice: false,
    description: "45-day nurture: educate, build trust, convert",
    status: "planned",
  },
  {
    id: "F-H2O-Welcome-Quiz",
    name: "Hydrogen Water Quiz Nurture",
    category: "entry",
    trigger: "Completed hydrogen water quiz",
    emailCount: 11,
    tieredByPrice: false,
    description: "45-day nurture: educate, build trust, convert",
    status: "planned",
  },
  {
    id: "F-REC-Welcome-Quiz",
    name: "Recovery Quiz Nurture",
    category: "entry",
    trigger: "Completed recovery quiz",
    emailCount: 11,
    tieredByPrice: false,
    description: "45-day nurture: educate, build trust, convert",
    status: "planned",
  },
  {
    id: "F-PIL-Welcome-Quiz",
    name: "Pilates Quiz Nurture",
    category: "entry",
    trigger: "Completed pilates quiz",
    emailCount: 11,
    tieredByPrice: false,
    description: "45-day nurture: educate, build trust, convert",
    status: "planned",
  },
  {
    id: "F-GYM-Welcome-Quiz",
    name: "Home Gym Quiz Nurture",
    category: "entry",
    trigger: "Completed home gym quiz",
    emailCount: 11,
    tieredByPrice: false,
    description: "45-day nurture: educate, build trust, convert",
    status: "planned",
  },
  // Add new quiz flows above this line
];

// ---------------------------------------------------------------------------
// Collection Popup Flows (primary email capture per collection)
// ---------------------------------------------------------------------------
const POPUP_FLOWS: FlowDefinition[] = [
  {
    id: "F-SAU-Popup",
    name: "Sauna Collection Popup",
    category: "entry",
    trigger: "Subscribes via sauna collection popup",
    emailCount: 3,
    tieredByPrice: false,
    description: "Category-specific welcome: sauna education, top picks, quiz CTA",
    status: "planned",
    emails: [
      { position: "P1", day: 0, contentType: "welcome", purpose: "Welcome + category intro + discount code" },
      { position: "P2", day: 2, contentType: "education", purpose: "Top 3 sauna picks + buying guide link" },
      { position: "P3", day: 4, contentType: "conversion", purpose: "Quiz CTA + social proof + consultation offer" },
    ],
  },
  {
    id: "F-HTR-Popup",
    name: "Sauna Heater Collection Popup",
    category: "entry",
    trigger: "Subscribes via sauna heater collection popup",
    emailCount: 3,
    tieredByPrice: false,
    description: "Category-specific welcome: heater education, top picks, consultation CTA",
    status: "planned",
    emails: [
      { position: "P1", day: 0, contentType: "welcome", purpose: "Welcome + category intro + discount code" },
      { position: "P2", day: 2, contentType: "education", purpose: "Top heater picks + buying guide link" },
      { position: "P3", day: 4, contentType: "conversion", purpose: "Social proof + consultation offer" },
    ],
  },
  {
    id: "F-CLD-Popup",
    name: "Cold Plunge Collection Popup",
    category: "entry",
    trigger: "Subscribes via cold plunge collection popup",
    emailCount: 3,
    tieredByPrice: false,
    description: "Category-specific welcome: cold plunge education, top picks, quiz CTA",
    status: "planned",
    emails: [
      { position: "P1", day: 0, contentType: "welcome", purpose: "Welcome + category intro + discount code" },
      { position: "P2", day: 2, contentType: "education", purpose: "Top cold plunge picks + buying guide" },
      { position: "P3", day: 4, contentType: "conversion", purpose: "Quiz CTA + social proof + consultation" },
    ],
  },
  {
    id: "F-RLT-Popup",
    name: "Red Light Collection Popup",
    category: "entry",
    trigger: "Subscribes via red light therapy collection popup",
    emailCount: 3,
    tieredByPrice: false,
    description: "Category-specific welcome: red light education, top picks, quiz CTA",
    status: "planned",
    emails: [
      { position: "P1", day: 0, contentType: "welcome", purpose: "Welcome + category intro + discount code" },
      { position: "P2", day: 2, contentType: "education", purpose: "Top red light picks + buying guide" },
      { position: "P3", day: 4, contentType: "conversion", purpose: "Quiz CTA + social proof + consultation" },
    ],
  },
  {
    id: "F-HYP-Popup",
    name: "Hyperbaric Collection Popup",
    category: "entry",
    trigger: "Subscribes via hyperbaric collection popup",
    emailCount: 3,
    tieredByPrice: false,
    description: "Category-specific welcome: hyperbaric education, top picks, quiz CTA",
    status: "planned",
    emails: [
      { position: "P1", day: 0, contentType: "welcome", purpose: "Welcome + category intro + discount code" },
      { position: "P2", day: 2, contentType: "education", purpose: "Top hyperbaric picks + buying guide" },
      { position: "P3", day: 4, contentType: "conversion", purpose: "Quiz CTA + social proof + consultation" },
    ],
  },
  {
    id: "F-H2O-Popup",
    name: "Hydrogen Water Collection Popup",
    category: "entry",
    trigger: "Subscribes via hydrogen water collection popup",
    emailCount: 3,
    tieredByPrice: false,
    description: "Category-specific welcome: hydrogen water education, top picks, quiz CTA",
    status: "planned",
    emails: [
      { position: "P1", day: 0, contentType: "welcome", purpose: "Welcome + category intro + discount code" },
      { position: "P2", day: 2, contentType: "education", purpose: "Top hydrogen water picks + buying guide" },
      { position: "P3", day: 4, contentType: "conversion", purpose: "Quiz CTA + social proof + consultation" },
    ],
  },
  {
    id: "F-ION-Popup",
    name: "Water Ionizer Collection Popup",
    category: "entry",
    trigger: "Subscribes via water ionizer collection popup",
    emailCount: 3,
    tieredByPrice: false,
    description: "Category-specific welcome: ionizer education, top picks, consultation CTA",
    status: "planned",
    emails: [
      { position: "P1", day: 0, contentType: "welcome", purpose: "Welcome + category intro + discount code" },
      { position: "P2", day: 2, contentType: "education", purpose: "Top ionizer picks + buying guide" },
      { position: "P3", day: 4, contentType: "conversion", purpose: "Social proof + consultation offer" },
    ],
  },
  {
    id: "F-REC-Popup",
    name: "Recovery Collection Popup",
    category: "entry",
    trigger: "Subscribes via recovery collection popup",
    emailCount: 3,
    tieredByPrice: false,
    description: "Category-specific welcome: recovery education, top picks, quiz CTA",
    status: "planned",
    emails: [
      { position: "P1", day: 0, contentType: "welcome", purpose: "Welcome + category intro + discount code" },
      { position: "P2", day: 2, contentType: "education", purpose: "Top recovery picks + buying guide" },
      { position: "P3", day: 4, contentType: "conversion", purpose: "Quiz CTA + social proof + consultation" },
    ],
  },
  {
    id: "F-PIL-Popup",
    name: "Pilates Collection Popup",
    category: "entry",
    trigger: "Subscribes via pilates collection popup",
    emailCount: 3,
    tieredByPrice: false,
    description: "Category-specific welcome: pilates education, top picks, quiz CTA",
    status: "planned",
    emails: [
      { position: "P1", day: 0, contentType: "welcome", purpose: "Welcome + category intro + discount code" },
      { position: "P2", day: 2, contentType: "education", purpose: "Top pilates picks + buying guide" },
      { position: "P3", day: 4, contentType: "conversion", purpose: "Quiz CTA + social proof + consultation" },
    ],
  },
  {
    id: "F-GYM-Popup",
    name: "Home Gym Collection Popup",
    category: "entry",
    trigger: "Subscribes via home gym collection popup",
    emailCount: 3,
    tieredByPrice: false,
    description: "Category-specific welcome: home gym education, top picks, quiz CTA",
    status: "planned",
    emails: [
      { position: "P1", day: 0, contentType: "welcome", purpose: "Welcome + category intro + discount code" },
      { position: "P2", day: 2, contentType: "education", purpose: "Top home gym picks + buying guide" },
      { position: "P3", day: 4, contentType: "conversion", purpose: "Quiz CTA + social proof + consultation" },
    ],
  },
  {
    id: "F-CRD-Popup",
    name: "Cardio Collection Popup",
    category: "entry",
    trigger: "Subscribes via cardio collection popup",
    emailCount: 3,
    tieredByPrice: false,
    description: "Category-specific welcome: cardio education, top picks, consultation CTA",
    status: "planned",
    emails: [
      { position: "P1", day: 0, contentType: "welcome", purpose: "Welcome + category intro + discount code" },
      { position: "P2", day: 2, contentType: "education", purpose: "Top cardio picks + buying guide" },
      { position: "P3", day: 4, contentType: "conversion", purpose: "Social proof + consultation offer" },
    ],
  },
  {
    id: "F-SPT-Popup",
    name: "Sports Collection Popup",
    category: "entry",
    trigger: "Subscribes via sports collection popup",
    emailCount: 3,
    tieredByPrice: false,
    description: "Category-specific welcome: sports education, top picks, consultation CTA",
    status: "planned",
    emails: [
      { position: "P1", day: 0, contentType: "welcome", purpose: "Welcome + category intro + discount code" },
      { position: "P2", day: 2, contentType: "education", purpose: "Top sports picks + buying guide" },
      { position: "P3", day: 4, contentType: "conversion", purpose: "Social proof + consultation offer" },
    ],
  },
  {
    id: "F-WEL-Popup",
    name: "Home Wellness Collection Popup",
    category: "entry",
    trigger: "Subscribes via home wellness collection popup",
    emailCount: 3,
    tieredByPrice: false,
    description: "Category-specific welcome: wellness education, top picks, consultation CTA",
    status: "planned",
    emails: [
      { position: "P1", day: 0, contentType: "welcome", purpose: "Welcome + category intro + discount code" },
      { position: "P2", day: 2, contentType: "education", purpose: "Top wellness picks + buying guide" },
      { position: "P3", day: 4, contentType: "conversion", purpose: "Social proof + consultation offer" },
    ],
  },
  {
    id: "F-SDT-Popup",
    name: "Float Tank Collection Popup",
    category: "entry",
    trigger: "Subscribes via float tank collection popup",
    emailCount: 3,
    tieredByPrice: false,
    description: "Category-specific welcome: float tank education, top picks, consultation CTA",
    status: "planned",
    emails: [
      { position: "P1", day: 0, contentType: "welcome", purpose: "Welcome + category intro + discount code" },
      { position: "P2", day: 2, contentType: "education", purpose: "Top float tank picks + buying guide" },
      { position: "P3", day: 4, contentType: "conversion", purpose: "Social proof + consultation offer" },
    ],
  },
];

// ---------------------------------------------------------------------------
// Engagement Flows
// ---------------------------------------------------------------------------
const ENGAGEMENT_FLOWS: FlowDefinition[] = [
  {
    id: "F-ALL-Browse-Abandon",
    name: "Browse Abandonment",
    category: "engagement",
    trigger: "Viewed product, no add to cart",
    emailCount: 2,
    tieredByPrice: false,
    description: "Re-engage browsers with viewed product + alternatives",
    status: "planned",
  },
  {
    id: "F-ALL-Cart-Abandon",
    name: "Cart Abandonment",
    category: "engagement",
    trigger: "Added to cart, no checkout started",
    emailCount: 13,
    tieredByPrice: true,
    description: "Tiered by cart value: entry (3), mid (4), high (6)",
    status: "planned",
  },
  {
    id: "F-ALL-Checkout-Abandon",
    name: "Checkout Abandonment",
    category: "engagement",
    trigger: "Started checkout, no purchase",
    emailCount: 13,
    tieredByPrice: true,
    description: "Tiered by checkout value: entry (3), mid (4), high (6)",
    status: "planned",
  },
];

// ---------------------------------------------------------------------------
// Post-Purchase Flows
// ---------------------------------------------------------------------------
const POST_PURCHASE_FLOWS: FlowDefinition[] = [
  {
    id: "F-ALL-Post-Purchase",
    name: "Post-Purchase",
    category: "post-purchase",
    trigger: "Placed order",
    emailCount: 6,
    tieredByPrice: true,
    description: "Order confirm → shipping → setup → check-in → review → upsell",
    status: "planned",
  },
  {
    id: "F-SAU-Accessory-Upsell",
    name: "Sauna Accessory Upsell",
    category: "post-purchase",
    trigger: "Purchased sauna 30+ days ago",
    emailCount: 3,
    tieredByPrice: false,
    description: "Drive accessory purchases for sauna owners",
    status: "planned",
  },
];

// ---------------------------------------------------------------------------
// Lifecycle Flows
// ---------------------------------------------------------------------------
const LIFECYCLE_FLOWS: FlowDefinition[] = [
  {
    id: "F-ALL-Winback-90",
    name: "90-Day Winback",
    category: "lifecycle",
    trigger: "Purchased 90-120 days ago, no engagement in 30 days",
    emailCount: 3,
    tieredByPrice: false,
    description: "Re-engage before churn with new content + offer",
    status: "planned",
  },
  {
    id: "F-ALL-VIP-Nurture",
    name: "VIP Nurture",
    category: "lifecycle",
    trigger: "Total order value >$10,000 or 3+ orders",
    emailCount: 3,
    tieredByPrice: false,
    description: "White-glove treatment for high-value customers",
    status: "planned",
  },
  {
    id: "F-ALL-Sunset",
    name: "Sunset / Unengaged Cleanup",
    category: "lifecycle",
    trigger: "No opens in 90 days",
    emailCount: 2,
    tieredByPrice: false,
    description: "Clean list or re-engage with final notice",
    status: "planned",
  },
];

// ---------------------------------------------------------------------------
// All Flows
// ---------------------------------------------------------------------------
export const ALL_FLOWS: FlowDefinition[] = [
  ...ENTRY_FLOWS,
  ...POPUP_FLOWS,
  ...ENGAGEMENT_FLOWS,
  ...POST_PURCHASE_FLOWS,
  ...LIFECYCLE_FLOWS,
];

export function getFlowsByCategory(cat: FlowCategory): FlowDefinition[] {
  return ALL_FLOWS.filter((f) => f.category === cat);
}

export function getFlowById(id: string): FlowDefinition | undefined {
  return ALL_FLOWS.find((f) => f.id === id);
}

export const FLOW_COUNTS = {
  entry: ENTRY_FLOWS.length,
  engagement: ENGAGEMENT_FLOWS.length,
  "post-purchase": POST_PURCHASE_FLOWS.length,
  lifecycle: LIFECYCLE_FLOWS.length,
  total: ALL_FLOWS.length,
};
