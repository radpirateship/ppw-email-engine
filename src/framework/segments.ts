// ============================================================================
// PPW Email Engine — Segment Architecture
// ============================================================================

export type SegmentGroup = "hot" | "warm" | "customer" | "interest" | "tier";

export interface SegmentDefinition {
  id: string;
  name: string;
  group: SegmentGroup;
  criteria: string[];
  description: string;
}

// ---------------------------------------------------------------------------
// Hot Lead Segments (High Purchase Intent)
// ---------------------------------------------------------------------------
const HOT_SEGMENTS: SegmentDefinition[] = [
  {
    id: "S-HOT-Checkout-Abandon-7d",
    name: "Checkout Abandon (7d)",
    group: "hot",
    criteria: [
      "Started checkout in last 7 days",
      "Did NOT purchase",
      "NOT suppressed",
    ],
    description: "High intent — started checkout but didn't complete",
  },
  {
    id: "S-HOT-Cart-Abandon-7d",
    name: "Cart Abandon (7d)",
    group: "hot",
    criteria: [
      "Added to cart in last 7 days",
      "Did NOT start checkout",
      "NOT suppressed",
    ],
    description: "Added to cart but didn't proceed to checkout",
  },
  {
    id: "S-HOT-High-Ticket-Browser",
    name: "High-Ticket Browser",
    group: "hot",
    criteria: [
      "Viewed products >$5,000",
      "Multiple sessions",
      "NOT purchased",
    ],
    description: "Researching expensive items across multiple visits",
  },
];

// ---------------------------------------------------------------------------
// Warm Lead Segments (Active Interest)
// ---------------------------------------------------------------------------
const WARM_SEGMENTS: SegmentDefinition[] = [
  {
    id: "S-WARM-Browse-Abandon-14d",
    name: "Browse Abandon (14d)",
    group: "warm",
    criteria: [
      "Viewed product in last 14 days",
      "Did NOT add to cart",
      "Opened/clicked email in last 30 days",
    ],
    description: "Browsing and engaged but hasn't added to cart",
  },
  {
    id: "S-WARM-Engaged-No-Purchase",
    name: "Engaged, No Purchase",
    group: "warm",
    criteria: [
      "On list 30+ days",
      "Opened 3+ emails",
      "Clicked 1+ emails",
      "Never purchased",
    ],
    description: "Active subscriber who hasn't converted yet",
  },
];

// ---------------------------------------------------------------------------
// Customer Segments
// ---------------------------------------------------------------------------
const CUSTOMER_SEGMENTS: SegmentDefinition[] = [
  {
    id: "S-CUST-First-Time",
    name: "First-Time Customer",
    group: "customer",
    criteria: ["Placed exactly 1 order", "Order in last 180 days"],
    description: "New customer, first order",
  },
  {
    id: "S-CUST-Repeat",
    name: "Repeat Customer",
    group: "customer",
    criteria: ["Placed 2+ orders"],
    description: "Has ordered more than once",
  },
  {
    id: "S-CUST-VIP",
    name: "VIP Customer",
    group: "customer",
    criteria: ["Total order value >$10,000", "OR 3+ orders"],
    description: "High-value customer, white-glove treatment",
  },
  {
    id: "S-CUST-At-Risk",
    name: "At-Risk Customer",
    group: "customer",
    criteria: [
      "Placed order 90-180 days ago",
      "No engagement in 30 days",
    ],
    description: "Customer showing signs of churn",
  },
  {
    id: "S-CUST-Churned",
    name: "Churned Customer",
    group: "customer",
    criteria: [
      "Placed order 180+ days ago",
      "No engagement in 60 days",
    ],
    description: "Inactive customer, likely lost",
  },
];

// ---------------------------------------------------------------------------
// Category Interest Segments (one per major category)
// ---------------------------------------------------------------------------
const INTEREST_SEGMENTS: SegmentDefinition[] = [
  {
    id: "S-INT-Saunas",
    name: "Sauna Interest",
    group: "interest",
    criteria: [
      "Has tag cat:saunas",
      "OR viewed sauna collection",
      "OR completed sauna quiz",
      "OR purchased sauna/accessory",
    ],
    description: "Interested in saunas from any source",
  },
  {
    id: "S-INT-Cold-Plunges",
    name: "Cold Plunge Interest",
    group: "interest",
    criteria: [
      "Has tag cat:cold-plunges",
      "OR viewed cold plunge collection",
      "OR completed cold plunge quiz",
    ],
    description: "Interested in cold plunges from any source",
  },
  {
    id: "S-INT-Red-Light",
    name: "Red Light Therapy Interest",
    group: "interest",
    criteria: [
      "Has tag cat:red-light-therapy",
      "OR viewed RLT collection",
      "OR completed RLT quiz",
    ],
    description: "Interested in red light therapy",
  },
  {
    id: "S-INT-Hyperbaric",
    name: "Hyperbaric Interest",
    group: "interest",
    criteria: [
      "Has tag cat:hyperbaric",
      "OR viewed hyperbaric collection",
      "OR completed hyperbaric quiz",
    ],
    description: "Interested in hyperbaric chambers",
  },
  {
    id: "S-INT-Hydrogen-Water",
    name: "Hydrogen Water Interest",
    group: "interest",
    criteria: [
      "Has tag cat:hydrogen-water",
      "OR viewed hydrogen water collection",
      "OR completed hydrogen water quiz",
    ],
    description: "Interested in hydrogen water",
  },
  {
    id: "S-INT-Recovery",
    name: "Recovery Interest",
    group: "interest",
    criteria: [
      "Has tag cat:massage-recovery",
      "OR viewed recovery collection",
      "OR completed recovery quiz",
    ],
    description: "Interested in massage & recovery",
  },
];

// ---------------------------------------------------------------------------
// Price Tier Segments
// ---------------------------------------------------------------------------
const TIER_SEGMENTS: SegmentDefinition[] = [
  {
    id: "S-TIER-Entry-Browsers",
    name: "Entry-Tier Browsers",
    group: "tier",
    criteria: ["Primarily browses products <$500", "Likely impulse buyer"],
    description: "Quick-close potential, impulse price range",
  },
  {
    id: "S-TIER-High-Ticket-Researchers",
    name: "High-Ticket Researchers",
    group: "tier",
    criteria: [
      "Browses products $5,000+",
      "Multiple sessions over 7+ days",
      "Hasn't purchased",
    ],
    description: "Needs nurturing, not hard sells",
  },
  {
    id: "S-TIER-Premium-Buyers",
    name: "Premium Buyers",
    group: "tier",
    criteria: [
      "Previous purchase >$10,000",
      "OR lifetime value >$15,000",
    ],
    description: "White glove treatment",
  },
];

// ---------------------------------------------------------------------------
// All Segments
// ---------------------------------------------------------------------------
export const ALL_SEGMENTS: SegmentDefinition[] = [
  ...HOT_SEGMENTS,
  ...WARM_SEGMENTS,
  ...CUSTOMER_SEGMENTS,
  ...INTEREST_SEGMENTS,
  ...TIER_SEGMENTS,
];

export function getSegmentsByGroup(group: SegmentGroup): SegmentDefinition[] {
  return ALL_SEGMENTS.filter((s) => s.group === group);
}

export function getSegmentById(id: string): SegmentDefinition | undefined {
  return ALL_SEGMENTS.find((s) => s.id === id);
}
