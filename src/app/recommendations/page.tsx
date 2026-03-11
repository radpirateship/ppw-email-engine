"use client";

import { useState, useMemo } from "react";
import { CATEGORIES, CATEGORY_CODES } from "@/framework/categories";
import {
  generateRecommendations,
  getCategoryProductSummary,
  type QuizProfile,
  type Recommendation,
  type RecommendationSet,
} from "@/framework/recommendation-engine";
import { CATALOG_STATS, type PriceTier } from "@/framework/product-catalog";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const PRICE_TIERS: { value: PriceTier; label: string; range: string }[] = [
  { value: "entry", label: "Entry", range: "Under $100" },
  { value: "mid", label: "Mid", range: "$100–$500" },
  { value: "premium", label: "Premium", range: "$500–$2,000" },
  { value: "elite", label: "Elite", range: "$2,000+" },
];

const GOALS = [
  "recovery",
  "detox",
  "performance",
  "relaxation",
  "pain",
  "sleep",
  "immunity",
  "weight",
  "stress",
  "skin",
  "energy",
  "longevity",
];

const SLOT_STYLES: Record<string, { bg: string; border: string; badge: string; label: string }> = {
  hero: { bg: "bg-amber-50", border: "border-amber-300", badge: "bg-amber-100 text-amber-800", label: "Hero Pick" },
  primary: { bg: "bg-green-50", border: "border-green-200", badge: "bg-green-100 text-green-700", label: "Primary" },
  secondary: { bg: "bg-blue-50", border: "border-blue-200", badge: "bg-blue-100 text-blue-700", label: "Secondary" },
  "cross-sell": { bg: "bg-purple-50", border: "border-purple-200", badge: "bg-purple-100 text-purple-700", label: "Cross-Sell" },
  accessory: { bg: "bg-gray-50", border: "border-gray-200", badge: "bg-gray-200 text-gray-600", label: "Accessory" },
};

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function CategoryPicker({
  selected,
  onToggle,
}: {
  selected: string[];
  onToggle: (code: string) => void;
}) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
      {CATEGORY_CODES.map((code) => {
        const cat = CATEGORIES[code];
        const idx = selected.indexOf(code);
        const isSelected = idx >= 0;
        return (
          <button
            key={code}
            onClick={() => onToggle(code)}
            className={`relative text-left px-3 py-2 rounded-lg border text-xs transition-all ${
              isSelected
                ? "border-green-400 bg-green-50 ring-2 ring-green-200"
                : "border-gray-200 bg-white hover:border-gray-300"
            }`}
          >
            {isSelected && (
              <span className="absolute top-1 right-1.5 text-[9px] font-bold text-green-600 bg-green-100 rounded-full w-4 h-4 flex items-center justify-center">
                {idx + 1}
              </span>
            )}
            <span className="font-mono text-[10px] text-gray-400 mr-1">{code}</span>
            <span className={isSelected ? "font-semibold text-green-800" : "text-gray-600"}>
              {cat.name}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function ProductCard({ rec }: { rec: Recommendation }) {
  const style = SLOT_STYLES[rec.slot] ?? SLOT_STYLES.primary;
  const p = rec.product;
  const hasDiscount = p.comparePrice && p.comparePrice > p.priceMin && p.priceMin > 0;

  return (
    <div className={`${style.bg} border ${style.border} rounded-lg p-4 transition-shadow hover:shadow-md`}>
      <div className="flex items-start justify-between mb-2">
        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${style.badge}`}>
          {style.label}
        </span>
        <span className="text-xs font-bold text-gray-700">Score: {rec.score}</span>
      </div>

      <h4 className="text-sm font-semibold text-gray-900 leading-snug mb-1 line-clamp-2">
        {p.title}
      </h4>

      <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
        <span>{p.vendor}</span>
        {p.categoryCode && (
          <>
            <span className="text-gray-300">·</span>
            <span className="font-mono text-[10px]">{p.categoryCode}</span>
          </>
        )}
      </div>

      <div className="flex items-center gap-2 mb-2">
        <span className="text-sm font-bold text-gray-900">
          ${p.priceMin.toLocaleString("en-US", { minimumFractionDigits: 2 })}
        </span>
        {hasDiscount && (
          <span className="text-xs text-red-400 line-through">
            ${p.comparePrice!.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </span>
        )}
        {p.truemed && (
          <span className="text-[9px] px-1.5 py-0.5 bg-teal-100 text-teal-700 rounded-full font-medium">
            HSA/FSA
          </span>
        )}
      </div>

      {p.rating !== null && (
        <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
          <span className="text-yellow-500">★</span>
          <span>{p.rating}</span>
          <span className="text-gray-300">({p.ratingCount})</span>
        </div>
      )}

      <div className="flex flex-wrap gap-1 mt-2">
        {rec.reasons.slice(0, 4).map((r, i) => (
          <span key={i} className="text-[9px] px-1.5 py-0.5 bg-white/60 border border-gray-200 rounded text-gray-500">
            {r}
          </span>
        ))}
      </div>
    </div>
  );
}

function SlotSection({
  title,
  items,
  emptyText,
}: {
  title: string;
  items: Recommendation[];
  emptyText: string;
}) {
  if (items.length === 0) {
    return (
      <div className="mb-4">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">{title}</h3>
        <p className="text-xs text-gray-400 italic">{emptyText}</p>
      </div>
    );
  }
  return (
    <div className="mb-6">
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
        {title} <span className="text-gray-300">({items.length})</span>
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {items.map((rec) => (
          <ProductCard key={rec.product.id} rec={rec} />
        ))}
      </div>
    </div>
  );
}

function CatalogStats() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
      {[
        { label: "Total Products", value: CATALOG_STATS.totalProducts.toLocaleString() },
        { label: "Categorized", value: String(CATALOG_STATS.categorized) },
        { label: "Vendors", value: String(CATALOG_STATS.totalVendors) },
        { label: "Uncategorized", value: String(CATALOG_STATS.uncategorized) },
      ].map((s) => (
        <div key={s.label} className="bg-white border border-gray-200 rounded-lg p-3 text-center">
          <p className="text-lg font-bold text-green-700">{s.value}</p>
          <p className="text-[10px] text-gray-400">{s.label}</p>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export default function RecommendationsPage() {
  const [interests, setInterests] = useState<string[]>([]);
  const [priceTier, setPriceTier] = useState<PriceTier>("premium");
  const [goals, setGoals] = useState<string[]>([]);
  const [hsaFsa, setHsaFsa] = useState(false);
  const [hasRun, setHasRun] = useState(false);

  const toggleInterest = (code: string) => {
    setInterests((prev) => {
      if (prev.includes(code)) return prev.filter((c) => c !== code);
      if (prev.length >= 5) return prev;
      return [...prev, code];
    });
  };

  const toggleGoal = (goal: string) => {
    setGoals((prev) =>
      prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal]
    );
  };

  const results: RecommendationSet | null = useMemo(() => {
    if (!hasRun || interests.length === 0) return null;
    const profile: QuizProfile = { interests, priceTier, goals, hsaFsa };
    return generateRecommendations(profile);
  }, [hasRun, interests, priceTier, goals, hsaFsa]);

  const categorySummaries = useMemo(() => {
    if (!results) return [];
    return interests
      .map((code) => getCategoryProductSummary(code))
      .filter(Boolean);
  }, [results, interests]);

  const canRun = interests.length >= 1;

  return (
    <div className="px-8 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
          Product Recommendations
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Generate personalized product recommendations based on quiz profiles, category affinity, and cross-sell logic.
        </p>
      </div>

      <CatalogStats />

      {/* Quiz Profile Builder */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <h2 className="text-sm font-bold text-gray-900 mb-4">Quiz Profile Builder</h2>

        {/* Interests */}
        <div className="mb-5">
          <label className="block text-xs font-semibold text-gray-600 mb-2">
            Interest Categories{" "}
            <span className="text-gray-400 font-normal">(select 1–5, order = priority)</span>
          </label>
          <CategoryPicker selected={interests} onToggle={toggleInterest} />
        </div>

        {/* Price Tier */}
        <div className="mb-5">
          <label className="block text-xs font-semibold text-gray-600 mb-2">Budget Tier</label>
          <div className="flex gap-2 flex-wrap">
            {PRICE_TIERS.map((t) => (
              <button
                key={t.value}
                onClick={() => setPriceTier(t.value)}
                className={`px-3 py-2 rounded-lg border text-xs transition-all ${
                  priceTier === t.value
                    ? "border-green-400 bg-green-50 ring-2 ring-green-200 font-semibold text-green-800"
                    : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                }`}
              >
                {t.label}{" "}
                <span className="text-gray-400">{t.range}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Goals */}
        <div className="mb-5">
          <label className="block text-xs font-semibold text-gray-600 mb-2">
            Health Goals <span className="text-gray-400 font-normal">(select any)</span>
          </label>
          <div className="flex gap-2 flex-wrap">
            {GOALS.map((g) => (
              <button
                key={g}
                onClick={() => toggleGoal(g)}
                className={`px-3 py-1.5 rounded-full border text-xs capitalize transition-all ${
                  goals.includes(g)
                    ? "border-green-400 bg-green-50 font-semibold text-green-700"
                    : "border-gray-200 bg-white text-gray-500 hover:border-gray-300"
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        {/* HSA/FSA Toggle */}
        <div className="mb-5 flex items-center gap-3">
          <button
            onClick={() => setHsaFsa(!hsaFsa)}
            className={`relative w-10 h-5 rounded-full transition-colors ${
              hsaFsa ? "bg-green-500" : "bg-gray-300"
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                hsaFsa ? "translate-x-5" : ""
              }`}
            />
          </button>
          <span className="text-xs text-gray-600">
            Customer has HSA/FSA (boost TrueMed-eligible products)
          </span>
        </div>

        {/* Run Button */}
        <button
          onClick={() => setHasRun(true)}
          disabled={!canRun}
          className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${
            canRun
              ? "bg-green-600 text-white hover:bg-green-700 shadow-sm"
              : "bg-gray-100 text-gray-400 cursor-not-allowed"
          }`}
        >
          Generate Recommendations
        </button>
      </div>

      {/* Results */}
      {results && (
        <div className="space-y-2">
          {/* Summary Bar */}
          <div className="flex items-center gap-4 bg-white border border-gray-200 rounded-lg px-5 py-3 mb-4">
            <div className="text-xs text-gray-500">
              <span className="font-bold text-gray-900 text-sm mr-1">
                {results.totalCandidates}
              </span>
              candidates scored
            </div>
            <div className="text-xs text-gray-300">|</div>
            <div className="text-xs text-gray-500">
              Interests: {interests.map((c) => <span key={c} className="font-mono text-green-600 mr-1">{c}</span>)}
            </div>
            <div className="text-xs text-gray-300">|</div>
            <div className="text-xs text-gray-500">
              Tier: <span className="font-semibold capitalize">{priceTier}</span>
            </div>
            {goals.length > 0 && (
              <>
                <div className="text-xs text-gray-300">|</div>
                <div className="text-xs text-gray-500">
                  Goals: {goals.map((g) => <span key={g} className="capitalize mr-1">{g}</span>)}
                </div>
              </>
            )}
          </div>

          {/* Hero */}
          {results.hero && (
            <div className="mb-6">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Hero Product
              </h3>
              <div className="max-w-md">
                <ProductCard rec={results.hero} />
              </div>
            </div>
          )}

          <SlotSection title="Primary Recommendations" items={results.primary} emptyText="No primary products matched." />
          <SlotSection title="Secondary Recommendations" items={results.secondary} emptyText="No secondary matches — add more interest categories." />
          <SlotSection title="Cross-Sell Opportunities" items={results.crossSell} emptyText="No cross-sell candidates found." />
          <SlotSection title="Accessories & Add-Ons" items={results.accessories} emptyText="No entry/mid accessories available." />

          {/* Category Summaries */}
          {categorySummaries.length > 0 && (
            <div className="mt-8">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Category Inventory Summary
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {categorySummaries.map((s: any) => (
                  <div key={s.categoryCode} className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-mono text-[10px] text-gray-400">{s.categoryCode}</span>
                      <span className="text-sm font-semibold text-gray-800">{s.categoryName}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      <div>
                        <p className="font-bold text-gray-700">{s.totalProducts}</p>
                        <p className="text-gray-400">Products</p>
                      </div>
                      <div>
                        <p className="font-bold text-gray-700">{s.vendors.length}</p>
                        <p className="text-gray-400">Vendors</p>
                      </div>
                      <div>
                        <p className="font-bold text-teal-600">{s.truemedEligible}</p>
                        <p className="text-gray-400">TrueMed</p>
                      </div>
                    </div>
                    {s.priceRange && (
                      <p className="text-[10px] text-gray-400 mt-2">
                        ${s.priceRange.min.toLocaleString()} – ${s.priceRange.max.toLocaleString()}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
