// ============================================================================
// PPW Email Engine — Price Tier System
// ============================================================================

export interface PriceTier {
  id: string;
  name: string;
  tag: string;
  minPrice: number;
  maxPrice: number | null;
  productCount: number;
  emailStrategy: string;
  emailTouchCount: string;
}

export const PRICE_TIERS: Record<string, PriceTier> = {
  entry: {
    id: "entry",
    name: "Entry",
    tag: "tier:entry",
    minPrice: 0,
    maxPrice: 499,
    productCount: 267,
    emailStrategy: "Impulse buying, quick closes",
    emailTouchCount: "1-3 emails",
  },
  mid: {
    id: "mid",
    name: "Mid",
    tag: "tier:mid",
    minPrice: 500,
    maxPrice: 1999,
    productCount: 351,
    emailStrategy: "Some research, 1-2 content touches",
    emailTouchCount: "3-4 emails",
  },
  high: {
    id: "high",
    name: "High",
    tag: "tier:high",
    minPrice: 2000,
    maxPrice: 9999,
    productCount: 550,
    emailStrategy: "Research phase, 5-8 nurture touches",
    emailTouchCount: "5-8 emails",
  },
  premium: {
    id: "premium",
    name: "Premium",
    tag: "tier:premium",
    minPrice: 10000,
    maxPrice: null,
    productCount: 90,
    emailStrategy: "High-touch, consultation-driven",
    emailTouchCount: "8-12 emails",
  },
} as const;

export const TIER_IDS = Object.keys(PRICE_TIERS) as Array<
  keyof typeof PRICE_TIERS
>;

export function getTierForPrice(price: number): PriceTier {
  if (price >= 10000) return PRICE_TIERS.premium;
  if (price >= 2000) return PRICE_TIERS.high;
  if (price >= 500) return PRICE_TIERS.mid;
  return PRICE_TIERS.entry;
}

export const TOTAL_PRODUCTS = Object.values(PRICE_TIERS).reduce(
  (sum, tier) => sum + tier.productCount,
  0
);
