// ============================================================================
// PPW Email Engine — Recommendations API
// GET /api/recommendations
//   ?interests=SAU,CLD       (comma-separated category codes, ordered)
//   &priceTier=premium        (entry|mid|premium|elite)
//   &goals=recovery,sleep     (comma-separated goal strings)
//   &hsaFsa=true              (boolean, optional)
//
// GET /api/recommendations?category=SAU
//   Returns category product summary
//
// GET /api/recommendations?product=<id>
//   Returns complementary products for a given product
// ============================================================================

import { NextResponse } from "next/server";
import {
  generateRecommendations,
  getCategoryProductSummary,
  getComplementaryProducts,
  toKlaviyoDynamicBlock,
  type QuizProfile,
} from "@/framework/recommendation-engine";
import { type PriceTier } from "@/framework/product-catalog";
import { CATEGORY_CODES } from "@/framework/categories";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);

    // ---- Mode 1: Category summary ----
    const categoryParam = url.searchParams.get("category");
    if (categoryParam) {
      const code = categoryParam.toUpperCase();
      if (!CATEGORY_CODES.includes(code as any)) {
        return NextResponse.json(
          { error: `Invalid category code: ${code}` },
          { status: 400 }
        );
      }
      const summary = getCategoryProductSummary(code);
      return NextResponse.json({ mode: "category-summary", data: summary });
    }

    // ---- Mode 2: Complementary products ----
    const productParam = url.searchParams.get("product");
    if (productParam) {
      const products = getComplementaryProducts(productParam, 4);
      return NextResponse.json({
        mode: "complementary",
        productId: productParam,
        data: products.map((p) => ({
          id: p.id,
          title: p.title,
          handle: p.handle,
          vendor: p.vendor,
          priceMin: p.priceMin,
          image: p.image,
          rating: p.rating,
          ratingCount: p.ratingCount,
          categoryCode: p.categoryCode,
        })),
      });
    }

    // ---- Mode 3: Full quiz-based recommendations ----
    const interestsParam = url.searchParams.get("interests");
    if (!interestsParam) {
      return NextResponse.json(
        {
          error: "Missing required parameter. Use ?interests=SAU,CLD&priceTier=premium&goals=recovery,sleep or ?category=SAU or ?product=<id>",
        },
        { status: 400 }
      );
    }

    const interests = interestsParam.split(",").map((s) => s.trim().toUpperCase());
    const priceTier = (url.searchParams.get("priceTier") ?? "mid") as PriceTier;
    const goals = (url.searchParams.get("goals") ?? "")
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);
    const hsaFsa = url.searchParams.get("hsaFsa") === "true";

    const profile: QuizProfile = { interests, priceTier, goals, hsaFsa };
    const recs = generateRecommendations(profile);
    const klaviyoBlock = toKlaviyoDynamicBlock(recs);

    return NextResponse.json({
      mode: "recommendations",
      profile,
      totalCandidates: recs.totalCandidates,
      results: {
        hero: recs.hero
          ? { product: recs.hero.product.title, score: recs.hero.score, reasons: recs.hero.reasons, slot: recs.hero.slot }
          : null,
        primary: recs.primary.map((r) => ({ product: r.product.title, score: r.score, reasons: r.reasons, id: r.product.id })),
        secondary: recs.secondary.map((r) => ({ product: r.product.title, score: r.score, reasons: r.reasons, id: r.product.id })),
        crossSell: recs.crossSell.map((r) => ({ product: r.product.title, score: r.score, reasons: r.reasons, id: r.product.id })),
        accessories: recs.accessories.map((r) => ({ product: r.product.title, score: r.score, reasons: r.reasons, id: r.product.id })),
      },
      klaviyoDynamicBlock: klaviyoBlock,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message ?? "Internal error" },
      { status: 500 }
    );
  }
}
