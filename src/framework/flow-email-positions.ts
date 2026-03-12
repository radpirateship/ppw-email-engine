// ============================================================================
// PPW Email Engine — Flow Type Email Position Definitions
// Maps each flow type to its email positions for the copy generator.
// ============================================================================

export interface FlowEmailPosition {
  position: string;
  day: number;
  contentType: string;
  purpose: string;
}

export interface FlowTypeDefinition {
  id: string;
  name: string;
  description: string;
  /** Whether this flow type requires a specific product category or uses "ALL" */
  requiresCategory: boolean;
  /** Flow ID pattern — use {CAT} as placeholder for category code */
  flowIdPattern: string;
  /** Template name pattern — use {CAT} and {POS} as placeholders */
  templateNamePattern: string;
  /** The email positions in this flow */
  positions: FlowEmailPosition[];
}

// ---------------------------------------------------------------------------
// Flow Type Definitions
// ---------------------------------------------------------------------------

export const FLOW_TYPES: FlowTypeDefinition[] = [
  {
    id: "quiz-nurture",
    name: "Quiz Nurture Sequence",
    description: "45-day nurture flow for quiz takers (E1–E11, 11 emails)",
    requiresCategory: true,
    flowIdPattern: "F-{CAT}-Welcome-Quiz",
    templateNamePattern: "T-{CAT}-Nurture-{POS}",
    positions: [
      { position: "E1", day: 0, contentType: "quiz-results", purpose: "Personalized product recommendations from quiz" },
      { position: "E2", day: 1, contentType: "deep-dive", purpose: "Detailed feature breakdown of #1 recommendation" },
      { position: "E3", day: 3, contentType: "benefit", purpose: "Health benefits aligned with stated goals" },
      { position: "E4", day: 5, contentType: "brand-spotlight", purpose: "Featured brand quality/warranty story" },
      { position: "E5", day: 8, contentType: "comparison", purpose: "Comparison guide (e.g., Traditional vs Infrared)" },
      { position: "E6", day: 12, contentType: "customer-story", purpose: "Case study, testimonial, lifestyle imagery" },
      { position: "E7", day: 17, contentType: "installation", purpose: "Installation guide, common concerns" },
      { position: "E8", day: 23, contentType: "consultation", purpose: "Have questions? Let's talk" },
      { position: "E9", day: 30, contentType: "offer", purpose: "Special offer or financing (optional)" },
      { position: "E10", day: 37, contentType: "buyers-guide", purpose: "Buyer's guide link, consultation reminder" },
      { position: "E11", day: 45, contentType: "soft-close", purpose: "Preference update, stay subscribed?" },
    ],
  },
  {
    id: "popup-welcome",
    name: "Collection Popup Welcome",
    description: "3-email welcome series for collection popup subscribers (P1–P3)",
    requiresCategory: true,
    flowIdPattern: "F-{CAT}-Popup",
    templateNamePattern: "T-{CAT}-Popup-{POS}",
    positions: [
      { position: "P1", day: 0, contentType: "welcome", purpose: "Welcome + category intro + discount code delivery" },
      { position: "P2", day: 2, contentType: "education", purpose: "Top 3 product picks + buying guide link" },
      { position: "P3", day: 4, contentType: "conversion", purpose: "Quiz CTA + social proof + consultation offer" },
    ],
  },
  {
    id: "general-welcome",
    name: "General Welcome Popup",
    description: "3-email welcome for master list popup subscribers",
    requiresCategory: false,
    flowIdPattern: "F-ALL-Welcome-Popup",
    templateNamePattern: "T-ALL-WelcomePopup-{POS}",
    positions: [
      { position: "W1", day: 0, contentType: "welcome", purpose: "Brand story + value prop + category overview" },
      { position: "W2", day: 2, contentType: "discovery", purpose: "Showcase top 3 categories with links" },
      { position: "W3", day: 4, contentType: "social-proof", purpose: "Testimonials + consultation offer" },
    ],
  },
  {
    id: "cart-abandon",
    name: "Cart Abandonment",
    description: "3-email cart recovery series (CA1–CA3)",
    requiresCategory: false,
    flowIdPattern: "F-ALL-Cart-Abandon",
    templateNamePattern: "T-ALL-CartAbandon-{POS}",
    positions: [
      { position: "CA1", day: 0, contentType: "reminder", purpose: "Soft reminder with cart contents + product image (1hr delay)" },
      { position: "CA2", day: 1, contentType: "benefits", purpose: "Product benefits + social proof + urgency (24hr)" },
      { position: "CA3", day: 3, contentType: "incentive", purpose: "Last chance + incentive offer + scarcity (72hr)" },
    ],
  },
  {
    id: "browse-abandon",
    name: "Browse Abandonment",
    description: "2-email series for product page viewers who didn't add to cart",
    requiresCategory: false,
    flowIdPattern: "F-ALL-Browse-Abandon",
    templateNamePattern: "T-ALL-BrowseAbandon-{POS}",
    positions: [
      { position: "BA1", day: 0, contentType: "reminder", purpose: "Product reminder + similar items + education link (2hr delay)" },
      { position: "BA2", day: 2, contentType: "social-proof", purpose: "Customer reviews + comparison guide + consultation CTA" },
    ],
  },
  {
    id: "checkout-abandon",
    name: "Checkout Abandonment",
    description: "3-email checkout recovery series (CK1–CK3)",
    requiresCategory: false,
    flowIdPattern: "F-ALL-Checkout-Abandon",
    templateNamePattern: "T-ALL-CheckoutAbandon-{POS}",
    positions: [
      { position: "CK1", day: 0, contentType: "recovery", purpose: "Complete your order + trust signals + support offer (1hr)" },
      { position: "CK2", day: 1, contentType: "objection-handling", purpose: "Address concerns + warranty/returns + financing options (24hr)" },
      { position: "CK3", day: 3, contentType: "final-push", purpose: "Expiring offer + free shipping/bonus + urgency (72hr)" },
    ],
  },
  {
    id: "post-purchase",
    name: "Post-Purchase",
    description: "6-email post-purchase nurture series (PP1–PP6)",
    requiresCategory: false,
    flowIdPattern: "F-ALL-Post-Purchase",
    templateNamePattern: "T-ALL-PostPurchase-{POS}",
    positions: [
      { position: "PP1", day: 0, contentType: "confirmation", purpose: "Order confirmation + what to expect + support info" },
      { position: "PP2", day: 3, contentType: "shipping", purpose: "Shipping update + preparation tips" },
      { position: "PP3", day: 7, contentType: "setup", purpose: "Setup guide + quick-start tips + video walkthrough" },
      { position: "PP4", day: 14, contentType: "check-in", purpose: "How's it going? + tips for getting the most out of it" },
      { position: "PP5", day: 30, contentType: "review-request", purpose: "Review request + share your experience" },
      { position: "PP6", day: 45, contentType: "upsell", purpose: "Complementary product recommendations + accessories" },
    ],
  },
  {
    id: "winback",
    name: "90-Day Winback",
    description: "3-email series to re-engage lapsed customers (WB1–WB3)",
    requiresCategory: false,
    flowIdPattern: "F-ALL-Winback-90",
    templateNamePattern: "T-ALL-Winback-{POS}",
    positions: [
      { position: "WB1", day: 0, contentType: "re-engagement", purpose: "We miss you + new arrivals + what's changed" },
      { position: "WB2", day: 7, contentType: "value-add", purpose: "Exclusive content + tips + community highlights" },
      { position: "WB3", day: 14, contentType: "incentive", purpose: "Welcome-back offer + consultation + urgency" },
    ],
  },
  {
    id: "vip-nurture",
    name: "VIP Nurture",
    description: "3-email white-glove series for high-value customers (VIP1–VIP3)",
    requiresCategory: false,
    flowIdPattern: "F-ALL-VIP-Nurture",
    templateNamePattern: "T-ALL-VIP-{POS}",
    positions: [
      { position: "VIP1", day: 0, contentType: "welcome-vip", purpose: "VIP welcome + exclusive benefits + dedicated support" },
      { position: "VIP2", day: 7, contentType: "early-access", purpose: "Early access to new products + VIP-only offers" },
      { position: "VIP3", day: 30, contentType: "appreciation", purpose: "Thank you + referral program + exclusive consultation" },
    ],
  },
  {
    id: "sunset",
    name: "Sunset / Unengaged Cleanup",
    description: "2-email series before removing unengaged subscribers (SU1–SU2)",
    requiresCategory: false,
    flowIdPattern: "F-ALL-Sunset",
    templateNamePattern: "T-ALL-Sunset-{POS}",
    positions: [
      { position: "SU1", day: 0, contentType: "re-engage", purpose: "Still interested? Best content recap + re-subscribe CTA" },
      { position: "SU2", day: 7, contentType: "final-notice", purpose: "Last chance to stay + what you'll miss + unsubscribe confirm" },
    ],
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export function getFlowType(id: string): FlowTypeDefinition | undefined {
  return FLOW_TYPES.find((ft) => ft.id === id);
}

export function getFlowIdForType(flowTypeId: string, categoryCode: string): string {
  const ft = getFlowType(flowTypeId);
  if (!ft) return "";
  return ft.flowIdPattern.replace("{CAT}", categoryCode);
}

export function getTemplateNameForType(
  flowTypeId: string,
  categoryCode: string,
  position: string
): string {
  const ft = getFlowType(flowTypeId);
  if (!ft) return "";
  return ft.templateNamePattern
    .replace("{CAT}", categoryCode)
    .replace("{POS}", position);
}
