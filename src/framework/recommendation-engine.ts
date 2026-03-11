// ============================================================================
// PPW Email Engine — Product Recommendation Engine
// Generates personalized product recommendations for email flows based on
// quiz results, category affinity, price tier, and cross-sell logic.
// ============================================================================

import {
  type Product,
  type PriceTier,
  PRODUCTS,
  getProductsByCategory,
  getProductsByPriceTier,
  getTopRatedProducts,
} from "./product-catalog";
import { CATEGORY_CODES } from "./categories";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface QuizProfile {
  /** Primary interest categories (ordered by preference) */
  interests: string[];
  /** Budget tier preference */
  priceTier: PriceTier;
  /** Specific goals (e.g., "recovery", "detox", "performance", "relaxation") */
  goals: string[];
  /** Whether the customer has HSA/FSA (TrueMed eligible) */
  hsaFsa?: boolean;
}

export interface Recommendation {
  product: Product;
  score: number;
  reasons: string[];
  slot: "hero" | "primary" | "secondary" | "cross-sell" | "accessory";
}

export interface RecommendationSet {
  profile: QuizProfile;
  hero: Recommendation | null;
  primary: Recommendation[];
  secondary: Recommendation[];
  crossSell: Recommendation[];
  accessories: Recommendation[];
  totalCandidates: number;
}

// ---------------------------------------------------------------------------
// Cross-sell affinity map: "if they like X, they'll probably like Y"
// ---------------------------------------------------------------------------

const CROSS_SELL_MAP: Record<string, string[]> = {
  SAU: ["CLD", "RLT", "AIR", "HWL"],
  CLD: ["SAU", "MSC", "RLT", "FIT"],
  RLT: ["SAU", "CLD", "MSC", "SLP"],
  FIT: ["MSC", "CLD", "WTR", "SLP"],
  MSC: ["CLD", "RLT", "FIT", "SLP"],
  WTR: ["AIR", "HWL", "SAU"],
  AIR: ["WTR", "SLP", "HWL"],
  EMF: ["SLP", "AIR", "RLT"],
  SLP: ["RLT", "MSC", "EMF", "AIR"],
  HBC: ["RLT", "CLD", "MSC"],
  SND: ["SLP", "MSC", "RLT"],
  PEM: ["RLT", "MSC", "CLD"],
  FLT: ["CLD", "SLP", "MSC"],
  HWL: ["SAU", "AIR", "WTR"],
  // Add new cross-sell entries above this line
};

// ---------------------------------------------------------------------------
// Goal → category boost map
// ---------------------------------------------------------------------------

const GOAL_CATEGORY_BOOST: Record<string, string[]> = {
  recovery: ["CLD", "MSC", "RLT", "HBC", "PEM"],
  detox: ["SAU", "WTR", "AIR", "FLT"],
  performance: ["FIT", "CLD", "HBC", "PEM"],
  relaxation: ["SAU", "MSC", "FLT", "SND", "SLP"],
  pain: ["RLT", "PEM", "MSC", "CLD"],
  sleep: ["SLP", "RLT", "SND", "EMF"],
  immunity: ["SAU", "CLD", "WTR", "AIR", "RLT"],
  weight: ["FIT", "SAU", "CLD"],
  stress: ["MSC", "FLT", "SND", "SLP", "SAU"],
  skin: ["RLT", "SAU", "WTR"],
  energy: ["CLD", "RLT", "FIT", "PEM"],
  longevity: ["SAU", "CLD", "RLT", "HBC", "WTR"],
};

// ---------------------------------------------------------------------------
// Tag-based goal matching keywords
// ---------------------------------------------------------------------------

const GOAL_TAG_KEYWORDS: Record<string, string[]> = {
  recovery: ["recovery", "compression", "therapy", "rehab", "muscle"],
  detox: ["detox", "cleanse", "purif", "filter"],
  performance: ["performance", "training", "athlete", "speed", "strength"],
  relaxation: ["relax", "spa", "calm", "comfort", "zen"],
  pain: ["pain", "relief", "therapy", "healing"],
  sleep: ["sleep", "night", "rest", "calm"],
};

// ---------------------------------------------------------------------------
// Scoring engine
// ---------------------------------------------------------------------------

function scoreProduct(product: Product, profile: QuizProfile): { score: number; reasons: string[] } {
  let score = 0;
  const reasons: string[] = [];

  // 1. Category match (primary interest = strongest signal)
  const catIndex = profile.interests.indexOf(product.categoryCode ?? "");
  if (catIndex === 0) {
    score += 50;
    reasons.push("Primary interest match");
  } else if (catIndex === 1) {
    score += 35;
    reasons.push("Secondary interest match");
  } else if (catIndex >= 2) {
    score += 20;
    reasons.push("Interest match");
  }

  // 2. Price tier match
  if (product.priceTier === profile.priceTier) {
    score += 20;
    reasons.push("Budget match");
  } else if (
    (profile.priceTier === "premium" && product.priceTier === "elite") ||
    (profile.priceTier === "elite" && product.priceTier === "premium") ||
    (profile.priceTier === "mid" && product.priceTier === "premium") ||
    (profile.priceTier === "premium" && product.priceTier === "mid")
  ) {
    score += 10;
    reasons.push("Near budget range");
  }

  // 3. Goal alignment
  for (const goal of profile.goals) {
    const goalCats = GOAL_CATEGORY_BOOST[goal] ?? [];
    if (product.categoryCode && goalCats.includes(product.categoryCode)) {
      score += 15;
      reasons.push(`Supports "${goal}" goal`);
    }

    const tagKws = GOAL_TAG_KEYWORDS[goal] ?? [];
    const tagStr = product.tags.join(" ").toLowerCase() + " " + product.type.toLowerCase();
    for (const kw of tagKws) {
      if (tagStr.includes(kw)) {
        score += 5;
        reasons.push(`Tag match: ${kw}`);
        break;
      }
    }
  }

  // 4. TrueMed eligibility bonus
  if (profile.hsaFsa && product.truemed) {
    score += 10;
    reasons.push("HSA/FSA eligible");
  }

  // 5. Rating quality bonus
  if (product.rating !== null && product.ratingCount >= 3) {
    const ratingBonus = Math.round(product.rating * Math.log2(product.ratingCount + 1));
    score += Math.min(ratingBonus, 15);
    reasons.push(`${product.rating}★ (${product.ratingCount} reviews)`);
  }

  // 6. On-sale bonus
  if (product.comparePrice && product.comparePrice > product.priceMin && product.priceMin > 0) {
    score += 5;
    reasons.push("On sale");
  }

  return { score, reasons };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Generate a full recommendation set for a quiz profile.
 */
export function generateRecommendations(profile: QuizProfile): RecommendationSet {
  const candidates: Recommendation[] = [];

  // Score all products with a category
  for (const product of PRODUCTS) {
    if (!product.categoryCode) continue;
    if (product.priceMin <= 0) continue;

    const { score, reasons } = scoreProduct(product, profile);
    if (score > 0) {
      candidates.push({ product, score, reasons, slot: "primary" });
    }
  }

  // Sort by score descending
  candidates.sort((a, b) => b.score - a.score);

  // Assign slots
  const usedIds = new Set<string>();
  let hero: Recommendation | null = null;
  const primary: Recommendation[] = [];
  const secondary: Recommendation[] = [];
  const crossSell: Recommendation[] = [];
  const accessories: Recommendation[] = [];

  // Hero: top-scored product from primary interest
  const primaryCat = profile.interests[0];
  for (const c of candidates) {
    if (c.product.categoryCode === primaryCat && !usedIds.has(c.product.id)) {
      hero = { ...c, slot: "hero" };
      usedIds.add(c.product.id);
      break;
    }
  }

  // Primary: top 3 from primary interest (excluding hero)
  for (const c of candidates) {
    if (primary.length >= 3) break;
    if (c.product.categoryCode === primaryCat && !usedIds.has(c.product.id)) {
      primary.push({ ...c, slot: "primary" });
      usedIds.add(c.product.id);
    }
  }

  // Secondary: top 3 from secondary interests
  const secondaryCats = profile.interests.slice(1);
  for (const c of candidates) {
    if (secondary.length >= 3) break;
    if (secondaryCats.includes(c.product.categoryCode ?? "") && !usedIds.has(c.product.id)) {
      secondary.push({ ...c, slot: "secondary" });
      usedIds.add(c.product.id);
    }
  }

  // Cross-sell: top 2 from affinity categories not in interests
  const affinityCats = CROSS_SELL_MAP[primaryCat] ?? [];
  const crossCats = affinityCats.filter(c => !profile.interests.includes(c));
  for (const c of candidates) {
    if (crossSell.length >= 2) break;
    if (crossCats.includes(c.product.categoryCode ?? "") && !usedIds.has(c.product.id)) {
      crossSell.push({ ...c, slot: "cross-sell" });
      usedIds.add(c.product.id);
    }
  }

  // Accessories: entry/mid products from primary interest
  for (const c of candidates) {
    if (accessories.length >= 3) break;
    if (
      c.product.categoryCode === primaryCat &&
      (c.product.priceTier === "entry" || c.product.priceTier === "mid") &&
      !usedIds.has(c.product.id)
    ) {
      accessories.push({ ...c, slot: "accessory" });
      usedIds.add(c.product.id);
    }
  }

  return {
    profile,
    hero,
    primary,
    secondary,
    crossSell,
    accessories,
    totalCandidates: candidates.length,
  };
}

/**
 * Get category-level product summary for email flow content blocks.
 */
export function getCategoryProductSummary(categoryCode: string) {
  const products = getProductsByCategory(categoryCode);
  if (products.length === 0) return null;

  const prices = products.filter(p => p.priceMin > 0).map(p => p.priceMin);
  const vendors = Array.from(new Set(products.map(p => p.vendor)));
  const types = Array.from(new Set(products.map(p => p.type).filter(Boolean)));
  const topRated = getTopRatedProducts(categoryCode, 3);
  const truemedCount = products.filter(p => p.truemed).length;

  const tierCounts: Record<PriceTier, number> = { entry: 0, mid: 0, premium: 0, elite: 0, unknown: 0 };
  for (const p of products) tierCounts[p.priceTier]++;

  return {
    categoryCode,
    categoryName: CATEGORY_CODES[categoryCode as keyof typeof CATEGORY_CODES] ?? categoryCode,
    totalProducts: products.length,
    priceRange: prices.length ? { min: Math.min(...prices), max: Math.max(...prices) } : null,
    vendors,
    types,
    topRated: topRated.map(p => ({ id: p.id, title: p.title, rating: p.rating, ratingCount: p.ratingCount, price: p.priceMin })),
    tierCounts,
    truemedEligible: truemedCount,
  };
}

/**
 * For a given product, find complementary products to recommend alongside it.
 */
export function getComplementaryProducts(productId: string, limit = 4): Product[] {
  const product = PRODUCTS.find(p => p.id === productId);
  if (!product || !product.categoryCode) return [];

  const crossCats = CROSS_SELL_MAP[product.categoryCode] ?? [];
  const results: Product[] = [];

  // Same-category accessories (lower price tier)
  const sameCategory = getProductsByCategory(product.categoryCode)
    .filter(p => p.id !== productId && p.priceMin > 0 && p.priceMin < product.priceMin * 0.5)
    .sort((a, b) => (b.rating ?? 0) * (b.ratingCount || 1) - (a.rating ?? 0) * (a.ratingCount || 1))
    .slice(0, 2);
  results.push(...sameCategory);

  // Cross-category top products
  for (const cat of crossCats) {
    if (results.length >= limit) break;
    const top = getTopRatedProducts(cat, 1);
    if (top.length > 0) results.push(top[0]);
  }

  return results.slice(0, limit);
}

/**
 * Generate Klaviyo-ready dynamic block data for product recommendations.
 */
export function toKlaviyoDynamicBlock(recs: RecommendationSet) {
  const formatProduct = (r: Recommendation) => ({
    product_id: r.product.id,
    product_title: r.product.title,
    product_url: `https://peakprimalwellness.com/products/${r.product.handle}`,
    product_image: r.product.image,
    product_price: `$${r.product.priceMin.toFixed(2)}`,
    product_compare_price: r.product.comparePrice ? `$${r.product.comparePrice.toFixed(2)}` : null,
    product_vendor: r.product.vendor,
    product_rating: r.product.rating,
    product_review_count: r.product.ratingCount,
    slot: r.slot,
    reasons: r.reasons.slice(0, 3),
    truemed_eligible: r.product.truemed,
  });

  return {
    hero: recs.hero ? formatProduct(recs.hero) : null,
    primary: recs.primary.map(formatProduct),
    secondary: recs.secondary.map(formatProduct),
    cross_sell: recs.crossSell.map(formatProduct),
    accessories: recs.accessories.map(formatProduct),
  };
}
