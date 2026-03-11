// ============================================================================
// PPW Email Engine — Campaign Calendar Framework
// ============================================================================
// Generates a 12-month campaign calendar with smart suggestions based on
// category seasonality, content inventory, and promotional strategy.
// ============================================================================

import { CATEGORIES, CATEGORY_CODES, QUIZ_CATEGORIES } from "./categories";
import { CATEGORY_CONTENT } from "./content-map";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type CampaignChannel = "email" | "sms" | "email+sms";
export type CampaignType =
  | "newsletter"
  | "seasonal-promo"
  | "product-launch"
  | "flash-sale"
  | "content-spotlight"
  | "holiday"
  | "winback"
  | "vip-exclusive"
  | "educational-series"
  | "cross-sell";

export type CampaignStatus = "planned" | "draft" | "scheduled" | "sent" | "cancelled";

export interface CampaignSuggestion {
  /** Suggested Klaviyo campaign name: C-[CAT]-[Name]-[YYYY-MM] */
  campaignName: string;
  /** Human-readable title */
  title: string;
  /** Campaign type */
  type: CampaignType;
  /** Target category code, or "ALL" for cross-category */
  categoryCode: string;
  /** Month (1-12) */
  month: number;
  /** Suggested week within month (1-4) */
  suggestedWeek: number;
  /** Channel */
  channel: CampaignChannel;
  /** Subject line suggestion */
  subjectLine: string;
  /** Campaign description / brief */
  brief: string;
  /** Target segments */
  targetSegments: string[];
  /** Exclusion segments */
  excludeSegments: string[];
  /** Content source — article title, promotion, etc. */
  contentSource: string;
  /** Status */
  status: CampaignStatus;
  /** Estimated audience reach label */
  audienceEstimate: string;
}

export interface MonthCalendar {
  month: number;
  monthName: string;
  year: number;
  campaigns: CampaignSuggestion[];
}

export interface AnnualCalendar {
  year: number;
  months: MonthCalendar[];
  totalCampaigns: number;
  byType: Record<CampaignType, number>;
  byCategory: Record<string, number>;
}

// ---------------------------------------------------------------------------
// Seasonal & Holiday Map
// ---------------------------------------------------------------------------

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

interface SeasonalEvent {
  month: number;
  week: number;
  name: string;
  type: CampaignType;
  brief: string;
  subjectLine: string;
  /** Which categories are most relevant (empty = ALL) */
  relevantCategories: string[];
}

const SEASONAL_EVENTS: SeasonalEvent[] = [
  {
    month: 1, week: 1, name: "New Year Wellness",
    type: "seasonal-promo",
    brief: "New Year, new wellness goals. Highlight quiz funnels across all categories for resolution-setters.",
    subjectLine: "Your 2026 Wellness Upgrade Starts Here",
    relevantCategories: [],
  },
  {
    month: 2, week: 2, name: "Valentine Self-Care",
    type: "seasonal-promo",
    brief: "Self-care and couples wellness angle. Saunas, massage, red light therapy.",
    subjectLine: "The Gift of Wellness — For You or Someone You Love",
    relevantCategories: ["SAU", "REC", "RLT"],
  },
  {
    month: 3, week: 2, name: "Spring Recovery",
    type: "content-spotlight",
    brief: "Spring training recovery content series. Cold plunges, recovery, home gym.",
    subjectLine: "Spring Into Recovery — What the Pros Use",
    relevantCategories: ["CLD", "REC", "GYM"],
  },
  {
    month: 4, week: 3, name: "Earth Day Wellness",
    type: "educational-series",
    brief: "Sustainable wellness at home. Hydrogen water, air purifiers, energy-efficient saunas.",
    subjectLine: "Sustainable Wellness for Your Home",
    relevantCategories: ["H2O", "WEL", "SAU"],
  },
  {
    month: 5, week: 2, name: "Mother's Day",
    type: "holiday",
    brief: "Gift guide for Mother's Day — pilates, massage chairs, red light therapy.",
    subjectLine: "The Mother's Day Gift She Actually Wants",
    relevantCategories: ["PIL", "REC", "RLT"],
  },
  {
    month: 5, week: 4, name: "Memorial Day Sale",
    type: "flash-sale",
    brief: "Memorial Day weekend promotion. Sitewide deals with urgency.",
    subjectLine: "Memorial Day Sale — Up to 20% Off Wellness Essentials",
    relevantCategories: [],
  },
  {
    month: 6, week: 2, name: "Father's Day",
    type: "holiday",
    brief: "Gift guide for Father's Day — saunas, home gym, cold plunges.",
    subjectLine: "Father's Day: Gifts He'll Use Every Day",
    relevantCategories: ["SAU", "GYM", "CLD"],
  },
  {
    month: 6, week: 4, name: "Summer Kickoff",
    type: "seasonal-promo",
    brief: "Outdoor saunas, cold plunges for summer. Backyard wellness setup guides.",
    subjectLine: "Build Your Backyard Wellness Retreat",
    relevantCategories: ["SAU", "CLD"],
  },
  {
    month: 7, week: 1, name: "Fourth of July",
    type: "flash-sale",
    brief: "Independence Day sale. Short flash sale across top categories.",
    subjectLine: "Fourth of July Flash Sale — 48 Hours Only",
    relevantCategories: [],
  },
  {
    month: 8, week: 3, name: "Back to Training",
    type: "content-spotlight",
    brief: "Back-to-school / back-to-training. Focus on athletic recovery and home gym.",
    subjectLine: "Level Up Your Training This Fall",
    relevantCategories: ["GYM", "CRD", "REC", "CLD"],
  },
  {
    month: 9, week: 1, name: "Labor Day Sale",
    type: "flash-sale",
    brief: "Labor Day weekend sale. Final summer promotion.",
    subjectLine: "Labor Day Sale — Last Chance for Summer Pricing",
    relevantCategories: [],
  },
  {
    month: 10, week: 2, name: "Fall Wellness Reset",
    type: "educational-series",
    brief: "Fall reset content series. Immune health, recovery, infrared sauna benefits.",
    subjectLine: "Your Fall Wellness Reset Starts Now",
    relevantCategories: ["SAU", "RLT", "HYP", "H2O"],
  },
  {
    month: 11, week: 3, name: "Black Friday Early Access",
    type: "vip-exclusive",
    brief: "VIP early access to Black Friday deals. Segment by engagement and purchase history.",
    subjectLine: "VIP Early Access — Black Friday Deals Inside",
    relevantCategories: [],
  },
  {
    month: 11, week: 4, name: "Black Friday / Cyber Monday",
    type: "flash-sale",
    brief: "Main Black Friday + Cyber Monday campaign. Biggest sale of the year.",
    subjectLine: "Black Friday — Our Biggest Sale of the Year",
    relevantCategories: [],
  },
  {
    month: 12, week: 1, name: "Holiday Gift Guide",
    type: "holiday",
    brief: "Holiday gift guide by budget tier and recipient type. Cross-category showcase.",
    subjectLine: "The Ultimate Wellness Gift Guide",
    relevantCategories: [],
  },
  {
    month: 12, week: 3, name: "Year-End Clearance",
    type: "flash-sale",
    brief: "Year-end clearance. Last chance deals before inventory turnover.",
    subjectLine: "Year-End Clearance — Final Deals of 2026",
    relevantCategories: [],
  },
];

// ---------------------------------------------------------------------------
// Category Seasonality — which months each category peaks
// ---------------------------------------------------------------------------

const CATEGORY_PEAK_MONTHS: Record<string, number[]> = {
  SAU: [1, 2, 10, 11, 12],     // Cold-weather months
  HTR: [1, 2, 10, 11, 12],     // Same as saunas
  CLD: [5, 6, 7, 8],           // Summer / hot months
  RLT: [1, 2, 3, 10, 11],      // Skin care + winter wellness
  HYP: [1, 3, 9, 10],          // Health-focused months
  H2O: [1, 5, 6, 7, 8],        // Summer hydration + New Year
  ION: [1, 5, 6, 7, 8],        // Same as H2O
  REC: [1, 3, 6, 9],           // Post-holiday, spring, back-to-school
  SDT: [1, 10, 11],            // Mental health awareness months
  PIL: [1, 3, 5, 9],           // New Year, spring, Mother's Day, fall
  GYM: [1, 2, 3, 9],           // New Year resolutions + fall
  CRD: [1, 2, 3, 9],           // Same as gym
  SPT: [3, 4, 8, 9],           // Spring/fall sports seasons
  WEL: [1, 4, 10, 11],         // New Year, Earth Day, fall wellness
};

// ---------------------------------------------------------------------------
// Campaign Name Builder
// ---------------------------------------------------------------------------

function buildCampaignName(
  categoryCode: string,
  name: string,
  year: number,
  month: number
): string {
  const slug = name.replace(/[^a-zA-Z0-9]+/g, "-").replace(/-+$/, "");
  const mm = String(month).padStart(2, "0");
  return `C-${categoryCode}-${slug}-${year}-${mm}`;
}

// ---------------------------------------------------------------------------
// Monthly Newsletter Generator
// ---------------------------------------------------------------------------

function generateMonthlyNewsletter(
  year: number,
  month: number
): CampaignSuggestion {
  const monthName = MONTH_NAMES[month - 1];
  // Pick 3 spotlight categories — prioritize quiz categories in peak months
  const peakCats = CATEGORY_CODES.filter(
    (c) => CATEGORY_PEAK_MONTHS[c]?.includes(month)
  );
  const spotlightCodes = peakCats.length >= 3
    ? peakCats.slice(0, 3)
    : [...peakCats, ...QUIZ_CATEGORIES.filter((c) => !peakCats.includes(c))].slice(0, 3);
  const spotlightNames = spotlightCodes.map((c) => CATEGORIES[c].name).join(", ");

  return {
    campaignName: buildCampaignName("ALL", "Monthly-Newsletter", year, month),
    title: `${monthName} Wellness Newsletter`,
    type: "newsletter",
    categoryCode: "ALL",
    month,
    suggestedWeek: 1,
    channel: "email",
    subjectLine: `Peak Primal Wellness — ${monthName} Edition`,
    brief: `Monthly newsletter featuring spotlight categories: ${spotlightNames}. Include new products, top content, and upcoming events.`,
    targetSegments: ["S-ALL-Engaged-30d"],
    excludeSegments: ["L-EXCLUDE-Unengaged"],
    contentSource: `Topical authority content from ${spotlightNames}`,
    status: "planned",
    audienceEstimate: "Full engaged list",
  };
}

// ---------------------------------------------------------------------------
// Category Content Spotlight Generator
// ---------------------------------------------------------------------------

function generateCategorySpotlights(
  year: number,
  month: number
): CampaignSuggestion[] {
  // For quiz categories in their peak month, suggest a content spotlight
  const results: CampaignSuggestion[] = [];
  const peakQuizCats = QUIZ_CATEGORIES.filter(
    (c) => CATEGORY_PEAK_MONTHS[c]?.includes(month)
  );

  // Limit to 2 per month to avoid over-sending
  const selected = peakQuizCats.slice(0, 2);

  for (let i = 0; i < selected.length; i++) {
    const code = selected[i];
    const cat = CATEGORIES[code];
    const content = CATEGORY_CONTENT.find((c) => c.categoryCode === code);
    const pillar = content?.pillarContent ?? `${cat.name} Guide`;

    results.push({
      campaignName: buildCampaignName(code, "Content-Spotlight", year, month),
      title: `${cat.name} Deep Dive`,
      type: "content-spotlight",
      categoryCode: code,
      month,
      suggestedWeek: i === 0 ? 2 : 3,
      channel: "email",
      subjectLine: `Everything You Need to Know About ${cat.name}`,
      brief: `Feature the "${pillar}" pillar content plus top articles from the ${cat.name} authority plan (${content?.articleCount ?? 0} articles available).`,
      targetSegments: [`S-INT-${cat.tagSlug}`, "S-WARM-Engaged-No-Purchase"],
      excludeSegments: ["L-EXCLUDE-Unengaged"],
      contentSource: pillar,
      status: "planned",
      audienceEstimate: `${cat.name} interest segment`,
    });
  }

  return results;
}

// ---------------------------------------------------------------------------
// Winback Campaign Generator (quarterly)
// ---------------------------------------------------------------------------

function generateWinbackCampaigns(
  year: number,
  month: number
): CampaignSuggestion[] {
  // Run winback campaigns quarterly: months 3, 6, 9, 12
  if (month % 3 !== 0) return [];

  return [{
    campaignName: buildCampaignName("ALL", "Winback-Q" + (month / 3), year, month),
    title: `Q${month / 3} Winback Campaign`,
    type: "winback",
    categoryCode: "ALL",
    month,
    suggestedWeek: 4,
    channel: "email+sms",
    subjectLine: "We miss you — here's what's new at Peak Primal Wellness",
    brief: `Quarterly winback targeting customers who purchased 90-180 days ago with no recent engagement. Include new products, content highlights, and exclusive returning-customer offer.`,
    targetSegments: ["S-CUST-At-Risk"],
    excludeSegments: ["S-CUST-Churned", "L-EXCLUDE-Complained"],
    contentSource: "New arrivals + category bestsellers",
    status: "planned",
    audienceEstimate: "At-risk customers (90-180 days)",
  }];
}

// ---------------------------------------------------------------------------
// Cross-sell Campaign Generator (bi-monthly)
// ---------------------------------------------------------------------------

const CROSS_SELL_PAIRS: Array<{ from: string; to: string; angle: string }> = [
  { from: "SAU", to: "CLD", angle: "Contrast therapy — combine heat and cold" },
  { from: "CLD", to: "SAU", angle: "Complete your contrast therapy setup" },
  { from: "SAU", to: "HTR", angle: "Upgrade your sauna with a premium heater" },
  { from: "RLT", to: "REC", angle: "Stack red light therapy with recovery tools" },
  { from: "GYM", to: "REC", angle: "Recover faster with massage and compression" },
  { from: "GYM", to: "CLD", angle: "Cold plunge recovery for serious athletes" },
  { from: "H2O", to: "ION", angle: "From hydrogen water to full water optimization" },
  { from: "PIL", to: "REC", angle: "Enhance your Pilates recovery routine" },
  { from: "HYP", to: "RLT", angle: "Combine hyperbaric with red light for maximum recovery" },
  { from: "CRD", to: "GYM", angle: "Build strength to complement your cardio" },
];

function generateCrossSellCampaigns(
  year: number,
  month: number
): CampaignSuggestion[] {
  // Run cross-sells in even months
  if (month % 2 !== 0) return [];

  const pairIndex = ((month / 2) - 1) % CROSS_SELL_PAIRS.length;
  const pair = CROSS_SELL_PAIRS[pairIndex];
  const fromCat = CATEGORIES[pair.from];
  const toCat = CATEGORIES[pair.to];

  return [{
    campaignName: buildCampaignName(pair.to, `Cross-Sell-from-${pair.from}`, year, month),
    title: `${fromCat.name} → ${toCat.name} Cross-Sell`,
    type: "cross-sell",
    categoryCode: pair.to,
    month,
    suggestedWeek: 3,
    channel: "email",
    subjectLine: pair.angle,
    brief: `Target ${fromCat.name} customers/engaged prospects with ${toCat.name} products. Angle: "${pair.angle}". Include product recommendations and educational content.`,
    targetSegments: [`S-INT-${fromCat.tagSlug}`, `S-CUST-${fromCat.tagSlug}`],
    excludeSegments: [`S-CUST-${toCat.tagSlug}`],
    contentSource: `${toCat.name} pillar content + product recommendations`,
    status: "planned",
    audienceEstimate: `${fromCat.name} buyers/interested`,
  }];
}

// ---------------------------------------------------------------------------
// Seasonal Event Campaigns
// ---------------------------------------------------------------------------

function generateSeasonalCampaigns(
  year: number,
  month: number
): CampaignSuggestion[] {
  const events = SEASONAL_EVENTS.filter((e) => e.month === month);

  return events.map((event) => {
    const catCode = event.relevantCategories.length > 0
      ? event.relevantCategories[0]
      : "ALL";
    const catNames = event.relevantCategories.length > 0
      ? event.relevantCategories.map((c) => CATEGORIES[c]?.name ?? c).join(", ")
      : "All categories";

    return {
      campaignName: buildCampaignName(catCode, event.name, year, month),
      title: event.name,
      type: event.type,
      categoryCode: catCode,
      month,
      suggestedWeek: event.week,
      channel: (event.type === "flash-sale" ? "email+sms" : "email") as CampaignChannel,
      subjectLine: event.subjectLine,
      brief: `${event.brief} Target categories: ${catNames}.`,
      targetSegments: event.type === "vip-exclusive"
        ? ["S-CUST-VIP", "S-CUST-Repeat"]
        : ["S-ALL-Engaged-30d"],
      excludeSegments: ["L-EXCLUDE-Unengaged"],
      contentSource: event.name,
      status: "planned",
      audienceEstimate: event.type === "vip-exclusive"
        ? "VIP + repeat customers"
        : event.relevantCategories.length > 0
          ? `${catNames} interest segments`
          : "Full engaged list",
    };
  });
}

// ---------------------------------------------------------------------------
// Public API — Build Full Calendar
// ---------------------------------------------------------------------------

/**
 * Generate a complete annual campaign calendar for the given year.
 */
export function buildAnnualCalendar(year: number): AnnualCalendar {
  const byType: Record<string, number> = {};
  const byCategory: Record<string, number> = {};
  const months: MonthCalendar[] = [];

  for (let m = 1; m <= 12; m++) {
    const campaigns: CampaignSuggestion[] = [
      generateMonthlyNewsletter(year, m),
      ...generateSeasonalCampaigns(year, m),
      ...generateCategorySpotlights(year, m),
      ...generateWinbackCampaigns(year, m),
      ...generateCrossSellCampaigns(year, m),
    ];

    // Sort by suggested week
    campaigns.sort((a, b) => a.suggestedWeek - b.suggestedWeek);

    // Track totals
    for (const c of campaigns) {
      byType[c.type] = (byType[c.type] ?? 0) + 1;
      byCategory[c.categoryCode] = (byCategory[c.categoryCode] ?? 0) + 1;
    }

    months.push({
      month: m,
      monthName: MONTH_NAMES[m - 1],
      year,
      campaigns,
    });
  }

  const totalCampaigns = months.reduce((sum, m) => sum + m.campaigns.length, 0);

  return {
    year,
    months,
    totalCampaigns,
    byType: byType as Record<CampaignType, number>,
    byCategory,
  };
}

/**
 * Get a single month's calendar.
 */
export function getMonthCalendar(year: number, month: number): MonthCalendar {
  const calendar = buildAnnualCalendar(year);
  return calendar.months[month - 1];
}

/**
 * Get campaign summary stats for the year.
 */
export interface CalendarSummary {
  year: number;
  totalCampaigns: number;
  campaignsPerMonth: number[];
  byType: Record<string, number>;
  byChannel: Record<string, number>;
  topCategories: Array<{ code: string; name: string; count: number }>;
  quizCategoryMonths: Array<{ code: string; name: string; peakMonths: string[] }>;
}

export function getCalendarSummary(year: number): CalendarSummary {
  const calendar = buildAnnualCalendar(year);
  const byChannel: Record<string, number> = {};
  const campaignsPerMonth: number[] = [];

  for (const month of calendar.months) {
    campaignsPerMonth.push(month.campaigns.length);
    for (const c of month.campaigns) {
      byChannel[c.channel] = (byChannel[c.channel] ?? 0) + 1;
    }
  }

  const topCategories = Object.entries(calendar.byCategory)
    .map(([code, count]) => ({
      code,
      name: code === "ALL" ? "Cross-Category" : (CATEGORIES[code]?.name ?? code),
      count,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  const quizCategoryMonths = QUIZ_CATEGORIES.map((code) => ({
    code,
    name: CATEGORIES[code].name,
    peakMonths: (CATEGORY_PEAK_MONTHS[code] ?? []).map((m) => MONTH_NAMES[m - 1].slice(0, 3)),
  }));

  return {
    year,
    totalCampaigns: calendar.totalCampaigns,
    campaignsPerMonth,
    byType: calendar.byType,
    byChannel,
    topCategories,
    quizCategoryMonths,
  };
}
