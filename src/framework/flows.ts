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
