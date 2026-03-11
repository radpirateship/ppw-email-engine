// ============================================================================
// PPW Email Engine — Onboarding Education Center
// Guided implementation checklist for building the full email marketing system.
// Organized in 4 phases matching the Klaviyo Organizational Framework roadmap.
// ============================================================================

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type PhaseId = "foundation" | "core-flows" | "expansion" | "optimization";

export type StepStatus = "locked" | "available" | "in-progress" | "complete" | "skipped";

export type StepDifficulty = "easy" | "medium" | "hard";

export interface OnboardingStep {
  id: string;
  phaseId: PhaseId;
  title: string;
  description: string;
  /** Detailed instructions shown when expanded */
  instructions: string[];
  /** Time estimate in minutes */
  estimatedMinutes: number;
  difficulty: StepDifficulty;
  /** Which dashboard tool helps with this step */
  toolLink?: string;
  toolLabel?: string;
  /** External link (e.g., Klaviyo docs) */
  externalLink?: string;
  externalLabel?: string;
  /** IDs of steps that must be complete before this one unlocks */
  dependsOn: string[];
  /** Category code if this is category-specific, "ALL" if cross-category */
  scope: string;
  /** Tags for filtering */
  tags: string[];
}

export interface Phase {
  id: PhaseId;
  name: string;
  description: string;
  icon: string;
  color: string;
  order: number;
}

// ---------------------------------------------------------------------------
// Phases
// ---------------------------------------------------------------------------

export const PHASES: Phase[] = [
  {
    id: "foundation",
    name: "Foundation",
    description: "Set up the organizational backbone — naming conventions, master lists, tags, and segments.",
    icon: "🏗️",
    color: "blue",
    order: 1,
  },
  {
    id: "core-flows",
    name: "Core Flows",
    description: "Build entry flows (welcome, quiz nurtures), abandonment flows, and post-purchase sequences.",
    icon: "⚡",
    color: "green",
    order: 2,
  },
  {
    id: "expansion",
    name: "Category Expansion",
    description: "Roll out flows to additional categories, build upsell sequences, and lifecycle automations.",
    icon: "🚀",
    color: "purple",
    order: 3,
  },
  {
    id: "optimization",
    name: "Optimization",
    description: "A/B testing, reporting dashboards, campaign calendar execution, and list health maintenance.",
    icon: "📊",
    color: "amber",
    order: 4,
  },
];

// ---------------------------------------------------------------------------
// Phase 1: Foundation Steps
// ---------------------------------------------------------------------------

const FOUNDATION_STEPS: OnboardingStep[] = [
  {
    id: "F01-review-naming",
    phaseId: "foundation",
    title: "Review naming conventions",
    description: "Understand the F-, C-, L-, S-, T- prefix system and category abbreviations.",
    instructions: [
      "Open the Framework Knowledge Base in the dashboard",
      "Review the naming convention reference card",
      "Familiarize yourself with category codes (SAU, CLD, RLT, etc.)",
      "Bookmark the convention — all Klaviyo assets will follow this pattern",
    ],
    estimatedMinutes: 10,
    difficulty: "easy",
    toolLink: "/framework",
    toolLabel: "Framework Knowledge Base",
    dependsOn: [],
    scope: "ALL",
    tags: ["naming", "setup"],
  },
  {
    id: "F02-create-master-lists",
    phaseId: "foundation",
    title: "Create master lists in Klaviyo",
    description: "Set up L-ALL-Master-Email and L-ALL-Master-SMS as the top-level subscriber lists.",
    instructions: [
      "In Klaviyo, go to Audience → Lists & Segments → Create List",
      "Create 'L-ALL-Master-Email' — this is your universal email subscriber list",
      "Create 'L-ALL-Master-SMS' — for SMS consent subscribers",
      "These will be the parent lists that all subscribers flow into",
      "Configure double opt-in if required for your region",
    ],
    estimatedMinutes: 15,
    difficulty: "easy",
    toolLink: "/klaviyo",
    toolLabel: "Klaviyo Sync Layer",
    externalLink: "https://help.klaviyo.com/hc/en-us/articles/115005078647",
    externalLabel: "Klaviyo: Creating lists",
    dependsOn: ["F01-review-naming"],
    scope: "ALL",
    tags: ["lists", "klaviyo", "setup"],
  },
  {
    id: "F03-create-category-lists",
    phaseId: "foundation",
    title: "Create category-specific lists",
    description: "Create subscriber lists for your priority categories (start with top 3-5).",
    instructions: [
      "Decide your top 3-5 priority categories (e.g., SAU, CLD, RLT)",
      "For each, create a Klaviyo list: L-SAU-Subscribers, L-CLD-Subscribers, etc.",
      "These capture category interest from popups, quizzes, and browse behavior",
      "Don't create all 14 at once — start with categories that have quizzes ready",
      "Use the Klaviyo Sync Layer to verify lists appear correctly",
    ],
    estimatedMinutes: 20,
    difficulty: "easy",
    toolLink: "/klaviyo",
    toolLabel: "Klaviyo Sync Layer",
    dependsOn: ["F02-create-master-lists"],
    scope: "ALL",
    tags: ["lists", "klaviyo", "categories"],
  },
  {
    id: "F04-create-exclusion-lists",
    phaseId: "foundation",
    title: "Create exclusion lists",
    description: "Set up suppression lists: recent purchasers, unengaged, spam complaints.",
    instructions: [
      "Create 'L-EXCLUDE-Purchased' — add buyers within last 30 days",
      "Create 'L-EXCLUDE-Unengaged' — subscribers with no opens in 90+ days",
      "Create 'L-EXCLUDE-Complained' — anyone who marked email as spam",
      "These lists will be used as exclusions in campaign sends",
      "Set up automatic flows or triggers to maintain these lists",
    ],
    estimatedMinutes: 15,
    difficulty: "medium",
    dependsOn: ["F02-create-master-lists"],
    scope: "ALL",
    tags: ["lists", "klaviyo", "exclusions", "deliverability"],
  },
  {
    id: "F05-setup-tags",
    phaseId: "foundation",
    title: "Set up tag taxonomy in Klaviyo",
    description: "Create the 7-category tag system: category, brand, price tier, source, quiz, engagement, lifecycle.",
    instructions: [
      "Tags in Klaviyo are applied to flows, campaigns, and templates",
      "Create category tags: cat:saunas, cat:cold-plunges, cat:red-light-therapy, etc.",
      "Create tier tags: tier:entry, tier:mid, tier:high, tier:premium",
      "Create source tags: source:popup, source:quiz, source:checkout-abandon",
      "Create engagement tags: engage:opened-30d, engage:clicked-30d",
      "Create lifecycle tags: stage:new-subscriber, stage:hot-lead, stage:customer, stage:vip",
      "These help organize and filter your Klaviyo workspace",
    ],
    estimatedMinutes: 25,
    difficulty: "easy",
    toolLink: "/framework",
    toolLabel: "Framework Knowledge Base",
    dependsOn: ["F01-review-naming"],
    scope: "ALL",
    tags: ["tags", "klaviyo", "organization"],
  },
  {
    id: "F06-create-core-segments",
    phaseId: "foundation",
    title: "Create core behavioral segments",
    description: "Build the must-have segments: hot leads (30d), warm leads (90d), VIP customers, recent purchasers.",
    instructions: [
      "In Klaviyo → Audience → Lists & Segments → Create Segment",
      "S-BHV-Hot-Leads-30d: Opened or clicked email in last 30 days AND has not purchased",
      "S-BHV-Warm-Leads-90d: Engaged in last 90 days but not 30 days",
      "S-CUS-VIP: Total order value > $10,000 OR 3+ orders",
      "S-CUS-Recent-Purchasers: Purchased in last 30 days",
      "S-CUS-Repeat-Buyers: 2+ orders total",
      "Check the Delta Dashboard to see which segments are missing vs live",
    ],
    estimatedMinutes: 30,
    difficulty: "medium",
    toolLink: "/klaviyo/delta",
    toolLabel: "Delta Dashboard",
    dependsOn: ["F02-create-master-lists"],
    scope: "ALL",
    tags: ["segments", "klaviyo", "behavioral"],
  },
  {
    id: "F07-connect-popups",
    phaseId: "foundation",
    title: "Connect website popups to lists",
    description: "Ensure your Shopify popups feed into the correct master and category lists.",
    instructions: [
      "Review existing popup forms in Klaviyo → Sign-up Forms",
      "Connect the main site popup to L-ALL-Master-Email",
      "If you have category-specific popups (e.g., sauna page popup), connect to both master AND category list",
      "Set up quiz completion triggers to add subscribers to quiz-specific lists",
      "Test each popup to verify subscribers land in the correct lists",
    ],
    estimatedMinutes: 30,
    difficulty: "medium",
    externalLink: "https://help.klaviyo.com/hc/en-us/articles/115005078327",
    externalLabel: "Klaviyo: Signup forms",
    dependsOn: ["F03-create-category-lists"],
    scope: "ALL",
    tags: ["popups", "forms", "integration"],
  },
  {
    id: "F08-email-style-setup",
    phaseId: "foundation",
    title: "Configure email style branding",
    description: "Set your brand colors, fonts, and spacing in the Email Style Editor.",
    instructions: [
      "Open the Email Style Editor in the dashboard",
      "Choose a preset that's closest to your brand, or start from Default",
      "Customize header/footer background colors, CTA button colors",
      "Set font family and sizes for headings and body text",
      "Preview a sample email to verify the look",
      "All generated emails will use these styles going forward",
    ],
    estimatedMinutes: 15,
    difficulty: "easy",
    toolLink: "/style-editor",
    toolLabel: "Email Style Editor",
    dependsOn: [],
    scope: "ALL",
    tags: ["branding", "styles", "templates"],
  },
];

// ---------------------------------------------------------------------------
// Phase 2: Core Flows Steps
// ---------------------------------------------------------------------------

const CORE_FLOW_STEPS: OnboardingStep[] = [
  {
    id: "CF01-welcome-popup-flow",
    phaseId: "core-flows",
    title: "Build welcome flow (popup subscribers)",
    description: "3-email welcome sequence: brand story → category discovery → social proof.",
    instructions: [
      "In Klaviyo → Flows → Create Flow → 'Create from Scratch'",
      "Name: F-ALL-Welcome-Popup",
      "Trigger: 'Added to list' → L-ALL-Master-Email",
      "Add flow filter: Has NOT been in this flow before",
      "Email 1 (Day 0): Brand story + value prop + category overview",
      "Email 2 (Day 2): Showcase top 3 categories with links",
      "Email 3 (Day 4): Testimonials + consultation offer",
      "Use the Copy Generator to draft each email's content",
      "Apply email styles from the Style Editor",
    ],
    estimatedMinutes: 60,
    difficulty: "medium",
    toolLink: "/copy-generator",
    toolLabel: "Copy Generator",
    dependsOn: ["F02-create-master-lists", "F08-email-style-setup"],
    scope: "ALL",
    tags: ["flows", "welcome", "entry"],
  },
  {
    id: "CF02-first-quiz-nurture",
    phaseId: "core-flows",
    title: "Build first quiz nurture flow (45-day)",
    description: "11-email nurture sequence for your highest-traffic quiz (likely Sauna Finder).",
    instructions: [
      "Pick your highest-traffic quiz (e.g., Sauna Finder → F-SAU-Welcome-Quiz)",
      "Trigger: 'Added to list' → L-QUIZ-Sauna-Finder",
      "Follow the 45-day position map: E1 (Day 0) through E11 (Day 45)",
      "E1: Personalized quiz results + product recommendations",
      "E2 (Day 1): Deep-dive on #1 recommendation",
      "E3 (Day 3): Health benefits aligned with their stated goals",
      "E4 (Day 5): Brand spotlight and quality story",
      "E5 (Day 8): Comparison guide (e.g., Infrared vs Traditional)",
      "E6 (Day 12): Customer story / testimonial",
      "E7 (Day 17): Installation guide, common concerns",
      "E8 (Day 23): Consultation offer",
      "E9 (Day 30): Special offer or financing",
      "E10 (Day 37): Buyer's guide + consultation reminder",
      "E11 (Day 45): Preference update / stay subscribed?",
      "Use the Pipeline tool to find matching content for each position",
      "Use the Copy Generator to generate each email",
    ],
    estimatedMinutes: 240,
    difficulty: "hard",
    toolLink: "/pipeline",
    toolLabel: "Content Pipeline",
    dependsOn: ["CF01-welcome-popup-flow"],
    scope: "SAU",
    tags: ["flows", "nurture", "quiz", "45-day"],
  },
  {
    id: "CF03-browse-abandon",
    phaseId: "core-flows",
    title: "Build browse abandonment flow",
    description: "2-email sequence for visitors who viewed a product but didn't add to cart.",
    instructions: [
      "Name: F-ALL-Browse-Abandon",
      "Trigger: Klaviyo 'Viewed Product' metric",
      "Flow filter: Has NOT 'Added to Cart' since starting this flow",
      "Flow filter: Has NOT been in this flow in last 30 days",
      "Email 1 (1 hour delay): 'Still looking at [product]?' with product image + alternatives",
      "Email 2 (24 hour delay): Category benefits + social proof",
      "Exclude recent purchasers (L-EXCLUDE-Purchased)",
      "Use dynamic product blocks to show the viewed product",
    ],
    estimatedMinutes: 45,
    difficulty: "medium",
    toolLink: "/copy-generator",
    toolLabel: "Copy Generator",
    dependsOn: ["CF01-welcome-popup-flow"],
    scope: "ALL",
    tags: ["flows", "abandonment", "engagement"],
  },
  {
    id: "CF04-cart-abandon",
    phaseId: "core-flows",
    title: "Build cart abandonment flow",
    description: "Tiered by cart value: entry (3 emails), mid (4 emails), high (6 emails).",
    instructions: [
      "Name: F-ALL-Cart-Abandon",
      "Trigger: Klaviyo 'Added to Cart' metric",
      "Flow filter: Has NOT 'Started Checkout' since starting flow",
      "Add conditional splits by cart value:",
      "— Entry tier ($0-499): 3 emails over 3 days",
      "— Mid tier ($500-1999): 4 emails over 5 days",
      "— High tier ($2000+): 6 emails over 14 days with consultation offer",
      "High-value carts get more touches, longer sequence, and personal outreach",
      "Include dynamic cart contents in each email",
      "For high tier: include financing options and TrueMed HSA/FSA eligibility",
    ],
    estimatedMinutes: 90,
    difficulty: "hard",
    toolLink: "/recommendations",
    toolLabel: "Recommendations Engine",
    dependsOn: ["CF03-browse-abandon"],
    scope: "ALL",
    tags: ["flows", "abandonment", "tiered", "engagement"],
  },
  {
    id: "CF05-checkout-abandon",
    phaseId: "core-flows",
    title: "Build checkout abandonment flow",
    description: "Same tiered structure as cart abandon, but triggered at checkout start.",
    instructions: [
      "Name: F-ALL-Checkout-Abandon",
      "Trigger: Klaviyo 'Started Checkout' metric",
      "Flow filter: Has NOT 'Placed Order' since starting flow",
      "Same tiered structure as cart abandonment (entry/mid/high)",
      "These prospects are further down the funnel — messaging should be more direct",
      "Email 1 should arrive within 1 hour",
      "Include urgency elements: limited stock, price protection",
      "For high tier: offer phone consultation or live chat support",
    ],
    estimatedMinutes: 90,
    difficulty: "hard",
    dependsOn: ["CF04-cart-abandon"],
    scope: "ALL",
    tags: ["flows", "abandonment", "tiered", "engagement"],
  },
  {
    id: "CF06-post-purchase",
    phaseId: "core-flows",
    title: "Build post-purchase flow",
    description: "6-email sequence: confirmation → shipping → setup → check-in → review → upsell.",
    instructions: [
      "Name: F-ALL-Post-Purchase",
      "Trigger: Klaviyo 'Placed Order' metric",
      "Email 1 (Day 0): Order confirmation + what to expect",
      "Email 2 (Day 3): Shipping update + setup preparation tips",
      "Email 3 (Day 7): Setup/installation guide for their product category",
      "Email 4 (Day 14): Check-in — how's the experience? Support available",
      "Email 5 (Day 21): Review request (link to product review page)",
      "Email 6 (Day 30): Cross-sell based on purchase category",
      "Use conditional splits to customize content by product category",
      "Add L-EXCLUDE-Purchased list entry at flow start",
    ],
    estimatedMinutes: 75,
    difficulty: "medium",
    toolLink: "/copy-generator",
    toolLabel: "Copy Generator",
    dependsOn: ["CF01-welcome-popup-flow"],
    scope: "ALL",
    tags: ["flows", "post-purchase", "retention"],
  },
];

// ---------------------------------------------------------------------------
// Phase 3: Expansion Steps
// ---------------------------------------------------------------------------

const EXPANSION_STEPS: OnboardingStep[] = [
  {
    id: "EX01-additional-quiz-flows",
    phaseId: "expansion",
    title: "Build additional quiz nurture flows",
    description: "Replicate the 45-day nurture pattern for your next 2-3 highest-traffic quizzes.",
    instructions: [
      "Review quiz completion data to identify your next highest-traffic quizzes",
      "For each quiz, create a new 45-day nurture flow following the same E1-E11 pattern",
      "Use the Pipeline tool to find category-specific content for each position",
      "Use the Copy Generator with category context for each email",
      "Each flow should be triggered by the category-specific quiz completion list",
      "Aim for Cold Plunge and Red Light as your next two categories",
    ],
    estimatedMinutes: 480,
    difficulty: "hard",
    toolLink: "/pipeline",
    toolLabel: "Content Pipeline",
    dependsOn: ["CF02-first-quiz-nurture"],
    scope: "ALL",
    tags: ["flows", "nurture", "quiz", "expansion"],
  },
  {
    id: "EX02-category-propagation",
    phaseId: "expansion",
    title: "Propagate new product categories",
    description: "Use the Category Propagator to add framework support for categories without quizzes yet.",
    instructions: [
      "Open the Category Propagator in the dashboard",
      "For each new category, fill in the form: code, name, keywords, cross-sell affinities",
      "Generate and apply the code patches to the framework files",
      "This ensures the system is ready when you build quizzes for these categories",
      "Priority categories to propagate: any with high search volume but no quiz yet",
    ],
    estimatedMinutes: 30,
    difficulty: "easy",
    toolLink: "/propagate",
    toolLabel: "Category Propagator",
    dependsOn: [],
    scope: "ALL",
    tags: ["categories", "propagation", "framework"],
  },
  {
    id: "EX03-accessory-upsell",
    phaseId: "expansion",
    title: "Build accessory upsell flows",
    description: "Post-purchase accessory sequences for categories with strong accessory attach rates.",
    instructions: [
      "Start with Sauna Accessories (F-SAU-Accessory-Upsell)",
      "Trigger: Purchased sauna 30+ days ago, no accessory purchase",
      "Email 1: 'Complete your sauna experience' — top accessories",
      "Email 2: Feature spotlight on best-selling accessory",
      "Email 3: Bundle offer or discount on accessories",
      "Use the Recommendations Engine to identify cross-sell products",
      "Replicate for other categories with strong accessory catalogs",
    ],
    estimatedMinutes: 60,
    difficulty: "medium",
    toolLink: "/recommendations",
    toolLabel: "Recommendations Engine",
    dependsOn: ["CF06-post-purchase"],
    scope: "SAU",
    tags: ["flows", "upsell", "post-purchase"],
  },
  {
    id: "EX04-winback-flow",
    phaseId: "expansion",
    title: "Build 90-day winback flow",
    description: "Re-engage customers who purchased 90-120 days ago with no recent engagement.",
    instructions: [
      "Name: F-ALL-Winback-90",
      "Trigger: Segment entry → purchased 90-120 days ago AND no email opens in 30 days",
      "Email 1: 'We miss you' + new products in their category",
      "Email 2: Exclusive winback offer or loyalty reward",
      "Email 3: Final notice + preference center link",
      "If no engagement after Email 3, move to sunset flow",
    ],
    estimatedMinutes: 45,
    difficulty: "medium",
    dependsOn: ["CF06-post-purchase"],
    scope: "ALL",
    tags: ["flows", "winback", "lifecycle"],
  },
  {
    id: "EX05-vip-nurture",
    phaseId: "expansion",
    title: "Build VIP nurture flow",
    description: "White-glove treatment for high-value customers ($10K+ or 3+ orders).",
    instructions: [
      "Name: F-ALL-VIP-Nurture",
      "Trigger: Segment entry → S-CUS-VIP (total value >$10K or 3+ orders)",
      "Email 1: Welcome to VIP status, exclusive perks",
      "Email 2: Early access to new products + dedicated support line",
      "Email 3: Referral program invitation + VIP-only offers",
      "These customers are your best advocates — treat them accordingly",
      "Consider adding a personal touch: hand-signed emails from the founder",
    ],
    estimatedMinutes: 45,
    difficulty: "medium",
    dependsOn: ["F06-create-core-segments"],
    scope: "ALL",
    tags: ["flows", "vip", "lifecycle", "retention"],
  },
  {
    id: "EX06-sunset-flow",
    phaseId: "expansion",
    title: "Build sunset / unengaged cleanup flow",
    description: "Clean your list by re-engaging or removing subscribers with no opens in 90 days.",
    instructions: [
      "Name: F-ALL-Sunset",
      "Trigger: Segment entry → no email opens in 90 days",
      "Email 1: 'Are you still interested?' — compelling subject line, best content",
      "Email 2 (7 days later): 'Last chance' — if no open, suppress from future sends",
      "Move non-openers to L-EXCLUDE-Unengaged",
      "This protects deliverability and keeps your list healthy",
      "Run this quarterly to maintain list quality",
    ],
    estimatedMinutes: 30,
    difficulty: "medium",
    dependsOn: ["F04-create-exclusion-lists"],
    scope: "ALL",
    tags: ["flows", "sunset", "deliverability", "lifecycle"],
  },
];

// ---------------------------------------------------------------------------
// Phase 4: Optimization Steps
// ---------------------------------------------------------------------------

const OPTIMIZATION_STEPS: OnboardingStep[] = [
  {
    id: "OP01-ab-testing-subjects",
    phaseId: "optimization",
    title: "Set up A/B testing for subject lines",
    description: "Test subject lines on your highest-volume flows to improve open rates.",
    instructions: [
      "Identify your top 3 highest-volume flows (likely welcome, cart abandon, post-purchase)",
      "For each flow's first email, create an A/B test with 2-3 subject line variants",
      "Test approaches: emoji vs no emoji, question vs statement, short vs long",
      "Let each test run for at least 1,000 sends before declaring a winner",
      "Apply winning subject lines and test the next email in the sequence",
      "Document results to build a subject line playbook for your brand",
    ],
    estimatedMinutes: 45,
    difficulty: "medium",
    dependsOn: ["CF01-welcome-popup-flow", "CF04-cart-abandon"],
    scope: "ALL",
    tags: ["testing", "optimization", "subject-lines"],
  },
  {
    id: "OP02-send-time-optimization",
    phaseId: "optimization",
    title: "Optimize send times",
    description: "Use Klaviyo's Smart Send Time or test manual send windows.",
    instructions: [
      "Enable Smart Send Time on your campaign sends",
      "For flows, test time delays: morning (8-10am) vs evening (6-8pm)",
      "Your audience likely researches wellness products in the evening",
      "Test weekend vs weekday sends for educational content",
      "Monitor open rates by send time to identify your audience's peak engagement windows",
    ],
    estimatedMinutes: 20,
    difficulty: "easy",
    dependsOn: ["OP01-ab-testing-subjects"],
    scope: "ALL",
    tags: ["testing", "optimization", "send-time"],
  },
  {
    id: "OP03-campaign-calendar-execution",
    phaseId: "optimization",
    title: "Execute monthly campaign calendar",
    description: "Begin executing the 2026 campaign calendar — newsletters, seasonal promos, content spotlights.",
    instructions: [
      "Open the Campaign Calendar in the dashboard",
      "Review this month's planned campaigns",
      "For each campaign, use the Copy Generator to draft content",
      "Schedule campaigns in Klaviyo with proper list targeting and exclusions",
      "Apply category and tier tags to each campaign",
      "Track performance and update the calendar with results",
      "Aim for 2-4 campaigns per month initially, scaling to 6-8",
    ],
    estimatedMinutes: 120,
    difficulty: "medium",
    toolLink: "/campaigns",
    toolLabel: "Campaign Calendar",
    dependsOn: ["CF01-welcome-popup-flow"],
    scope: "ALL",
    tags: ["campaigns", "calendar", "execution"],
  },
  {
    id: "OP04-deliverability-monitoring",
    phaseId: "optimization",
    title: "Set up deliverability monitoring",
    description: "Track bounce rates, spam complaints, and inbox placement.",
    instructions: [
      "In Klaviyo, review your deliverability dashboard weekly",
      "Target metrics: <2% bounce rate, <0.1% spam complaint rate, >95% delivery rate",
      "Ensure sunset flow is running to clean unengaged subscribers",
      "Monitor domain reputation via Google Postmaster Tools",
      "Set up DKIM, SPF, and DMARC if not already configured",
      "Use the Delta Dashboard to track list health metrics",
    ],
    estimatedMinutes: 30,
    difficulty: "medium",
    toolLink: "/klaviyo/delta",
    toolLabel: "Delta Dashboard",
    dependsOn: ["EX06-sunset-flow"],
    scope: "ALL",
    tags: ["deliverability", "monitoring", "health"],
  },
  {
    id: "OP05-revenue-attribution",
    phaseId: "optimization",
    title: "Review revenue attribution",
    description: "Analyze which flows and campaigns drive the most revenue.",
    instructions: [
      "In Klaviyo → Analytics → Revenue Attribution",
      "Identify your top 5 revenue-generating flows",
      "Compare revenue per recipient across flow types",
      "Look for underperforming flows that need content refreshes",
      "Use the Completion Tracker to see which categories have room for improvement",
      "Set monthly revenue goals for email channel",
    ],
    estimatedMinutes: 30,
    difficulty: "easy",
    toolLink: "/completion",
    toolLabel: "Category Completion",
    dependsOn: ["CF06-post-purchase"],
    scope: "ALL",
    tags: ["analytics", "revenue", "reporting"],
  },
  {
    id: "OP06-content-refresh",
    phaseId: "optimization",
    title: "Quarterly content refresh cycle",
    description: "Update email content with fresh testimonials, new products, and seasonal angles.",
    instructions: [
      "Review flow email performance quarterly",
      "Update product images and pricing for any changed products",
      "Add new testimonials and customer stories",
      "Refresh seasonal angles (e.g., 'Summer cold plunge' → 'Winter recovery')",
      "Update the Content Pipeline with new blog posts and articles",
      "Re-generate emails using the Copy Generator with updated content",
      "Test refreshed emails against originals via A/B testing",
    ],
    estimatedMinutes: 180,
    difficulty: "medium",
    toolLink: "/pipeline",
    toolLabel: "Content Pipeline",
    dependsOn: ["CF02-first-quiz-nurture"],
    scope: "ALL",
    tags: ["content", "refresh", "maintenance"],
  },
];

// ---------------------------------------------------------------------------
// All Steps
// ---------------------------------------------------------------------------

export const ALL_STEPS: OnboardingStep[] = [
  ...FOUNDATION_STEPS,
  ...CORE_FLOW_STEPS,
  ...EXPANSION_STEPS,
  ...OPTIMIZATION_STEPS,
];

// ---------------------------------------------------------------------------
// Milestone definitions (unlocked at completion thresholds)
// ---------------------------------------------------------------------------

export interface Milestone {
  id: string;
  title: string;
  description: string;
  icon: string;
  /** Number of completed steps to unlock */
  threshold: number;
}

export const MILESTONES: Milestone[] = [
  { id: "M01", title: "First Steps", description: "Completed your first onboarding step!", icon: "🌱", threshold: 1 },
  { id: "M02", title: "Foundation Builder", description: "Completed 5 steps — your foundation is taking shape.", icon: "🧱", threshold: 5 },
  { id: "M03", title: "Flow Master", description: "Completed 10 steps — core flows are live!", icon: "⚡", threshold: 10 },
  { id: "M04", title: "Category Champion", description: "Completed 15 steps — expanding across categories.", icon: "🏆", threshold: 15 },
  { id: "M05", title: "Email Engine Complete", description: "All steps done — your email marketing machine is fully operational!", icon: "🚀", threshold: ALL_STEPS.length },
];

// ---------------------------------------------------------------------------
// Helper functions
// ---------------------------------------------------------------------------

export function getStepsByPhase(phaseId: PhaseId): OnboardingStep[] {
  return ALL_STEPS.filter((s) => s.phaseId === phaseId);
}

export function getStepById(id: string): OnboardingStep | undefined {
  return ALL_STEPS.find((s) => s.id === id);
}

/**
 * Given a set of completed step IDs, compute which steps are available (dependencies met).
 */
export function computeStepStatuses(completedIds: Set<string>): Map<string, StepStatus> {
  const statuses = new Map<string, StepStatus>();

  for (const step of ALL_STEPS) {
    if (completedIds.has(step.id)) {
      statuses.set(step.id, "complete");
    } else {
      const depsComplete = step.dependsOn.every((dep) => completedIds.has(dep));
      statuses.set(step.id, depsComplete ? "available" : "locked");
    }
  }

  return statuses;
}

/**
 * Compute overall progress stats.
 */
export function computeProgress(completedIds: Set<string>) {
  const total = ALL_STEPS.length;
  const completed = completedIds.size;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  const byPhase: Record<PhaseId, { total: number; completed: number; percentage: number }> = {
    foundation: { total: 0, completed: 0, percentage: 0 },
    "core-flows": { total: 0, completed: 0, percentage: 0 },
    expansion: { total: 0, completed: 0, percentage: 0 },
    optimization: { total: 0, completed: 0, percentage: 0 },
  };

  for (const step of ALL_STEPS) {
    byPhase[step.phaseId].total++;
    if (completedIds.has(step.id)) {
      byPhase[step.phaseId].completed++;
    }
  }

  for (const phase of Object.values(byPhase)) {
    phase.percentage = phase.total > 0 ? Math.round((phase.completed / phase.total) * 100) : 0;
  }

  const unlockedMilestones = MILESTONES.filter((m) => completed >= m.threshold);
  const nextMilestone = MILESTONES.find((m) => completed < m.threshold) ?? null;

  // Estimated total time remaining
  const statuses = computeStepStatuses(completedIds);
  let remainingMinutes = 0;
  for (const step of ALL_STEPS) {
    if (!completedIds.has(step.id)) {
      remainingMinutes += step.estimatedMinutes;
    }
  }

  return {
    total,
    completed,
    percentage,
    byPhase,
    unlockedMilestones,
    nextMilestone,
    remainingMinutes,
    remainingHours: Math.round(remainingMinutes / 60),
  };
}

export const STEP_COUNTS = {
  foundation: FOUNDATION_STEPS.length,
  "core-flows": CORE_FLOW_STEPS.length,
  expansion: EXPANSION_STEPS.length,
  optimization: OPTIMIZATION_STEPS.length,
  total: ALL_STEPS.length,
};
