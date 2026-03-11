// ============================================================================
// PPW Email Engine — Category Propagator API
// Generates all framework file patches to add a new product category
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import { CATEGORIES } from "@/framework/categories";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface NewCategoryInput {
  code: string; // 3-letter uppercase code
  name: string;
  keyProducts: string[];
  articleCount: number;
  hasQuiz: boolean;
  tagSlug: string;
  pillarContent: string; // e.g. "Ultimate Guide to Squat Racks"
  contentAreas: string[]; // 5 content pillars
  classifierKeywords: string[]; // 10+ keywords for content classifier
  crossSellCategories: string[]; // 2-4 related category codes
  goalBoosts: string[]; // which goals this category maps to
  entryCriteria: string; // list entry criteria
}

export interface PropagationResult {
  success: boolean;
  categoryCode: string;
  patches: {
    file: string;
    description: string;
    snippet: string;
    insertAfter?: string;
  }[];
  summary: string;
}

// ---------------------------------------------------------------------------
// GET — return current categories + available goal/cross-sell options
// ---------------------------------------------------------------------------

export async function GET() {
  const existingCodes = Object.keys(CATEGORIES);
  const existingCategories = Object.entries(CATEGORIES).map(([code, cat]) => ({
    code,
    name: cat.name,
    hasQuiz: cat.hasQuiz,
  }));

  const availableGoals = [
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

  return NextResponse.json({
    existingCategories,
    existingCodes,
    availableGoals,
    nurtureDays: [0, 1, 3, 5, 8, 12, 17, 23, 30, 37, 45],
    emailPositions: [
      "E1: Quiz Results (Day 0)",
      "E2: Deep Dive (Day 1)",
      "E3: Health Benefits (Day 3)",
      "E4: Brand Spotlight (Day 5)",
      "E5: Comparison Guide (Day 8)",
      "E6: Customer Story (Day 12)",
      "E7: Installation Guide (Day 17)",
      "E8: Consultation CTA (Day 23)",
      "E9: Special Offer (Day 30)",
      "E10: Buyer's Guide (Day 37)",
      "E11: Soft Close (Day 45)",
    ],
  });
}

// ---------------------------------------------------------------------------
// POST — generate all patches for a new category
// ---------------------------------------------------------------------------

export async function POST(req: NextRequest) {
  try {
    const input: NewCategoryInput = await req.json();

    // Validate
    if (!input.code || input.code.length !== 3 || input.code !== input.code.toUpperCase()) {
      return NextResponse.json(
        { error: "Category code must be exactly 3 uppercase letters" },
        { status: 400 }
      );
    }

    if (CATEGORIES[input.code as keyof typeof CATEGORIES]) {
      return NextResponse.json(
        { error: `Category code "${input.code}" already exists` },
        { status: 400 }
      );
    }

    if (!input.name || !input.tagSlug) {
      return NextResponse.json(
        { error: "Name and tagSlug are required" },
        { status: 400 }
      );
    }

    if (input.contentAreas.length < 3) {
      return NextResponse.json(
        { error: "At least 3 content areas are required" },
        { status: 400 }
      );
    }

    const patches = generatePatches(input);

    const result: PropagationResult = {
      success: true,
      categoryCode: input.code,
      patches,
      summary: buildSummary(input),
    };

    return NextResponse.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// Patch generators
// ---------------------------------------------------------------------------

function generatePatches(input: NewCategoryInput) {
  const patches = [];

  // 1. categories.ts
  patches.push({
    file: "src/framework/categories.ts",
    description: `Add ${input.code} to CATEGORIES object`,
    snippet: `  ${input.code}: {
    code: "${input.code}",
    name: "${input.name}",
    fullName: "${input.name}",
    keyProducts: ${JSON.stringify(input.keyProducts)},
    articleCount: ${input.articleCount},
    hasQuiz: ${input.hasQuiz},
    tagSlug: "${input.tagSlug}",
  },`,
    insertAfter: "// Add new categories above this line",
  });

  // 2. content-map.ts
  const contentAreasStr = input.contentAreas
    .map((a) => `    "${a}",`)
    .join("\n");
  patches.push({
    file: "src/framework/content-map.ts",
    description: `Add ${input.code} content inventory`,
    snippet: `  {
    categoryCode: "${input.code}",
    articleCount: ${input.articleCount},
    pillarContent: "${input.pillarContent}",
    contentAreas: [
${contentAreasStr}
    ],
  },`,
    insertAfter: "// Add new category content above this line",
  });

  // 3. classifier.ts
  const keywordsStr = input.classifierKeywords
    .map((k) => `    "${k}",`)
    .join("\n");
  patches.push({
    file: "src/framework/classifier.ts",
    description: `Add ${input.code} classification keywords`,
    snippet: `  ${input.code}: [
${keywordsStr}
  ],`,
    insertAfter: "// Add new category keywords above this line",
  });

  // 4. recommendation-engine.ts — cross-sell map
  patches.push({
    file: "src/framework/recommendation-engine.ts",
    description: `Add ${input.code} cross-sell affinity`,
    snippet: `  ${input.code}: ${JSON.stringify(input.crossSellCategories)},`,
    insertAfter: "// Add new cross-sell entries above this line",
  });

  // 5. recommendation-engine.ts — goal boosts
  if (input.goalBoosts.length > 0) {
    patches.push({
      file: "src/framework/recommendation-engine.ts",
      description: `Add ${input.code} to goal boost categories: ${input.goalBoosts.join(", ")}`,
      snippet: input.goalBoosts
        .map((g) => `  // Add "${input.code}" to the "${g}" array in GOAL_CATEGORY_BOOST`)
        .join("\n"),
    });
  }

  // 6. lists.ts
  patches.push({
    file: "src/framework/lists.ts",
    description: `Add L-${input.code}-Subscribers list`,
    snippet: `  { id: "L-${input.code}-Subscribers", name: "${input.name} Subscribers", type: "category", entryCriteria: "${input.entryCriteria}" },`,
    insertAfter: "// Add new category lists above this line",
  });

  // 7. segments.ts
  patches.push({
    file: "src/framework/segments.ts",
    description: `Add S-INT-${input.name.replace(/\s+/g, "")} segment`,
    snippet: `  {
    id: "S-INT-${input.name.replace(/\s+/g, "")}",
    name: "${input.name} Interest",
    group: "interest",
    criteria: [
      "Has tag cat:${input.tagSlug}",
      "OR viewed ${input.name.toLowerCase()} collection",
      ${input.hasQuiz ? `"OR completed ${input.name.toLowerCase()} quiz",` : ""}
    ],
    description: "Interested in ${input.name.toLowerCase()}",
  },`,
    insertAfter: "// Add new interest segments above this line",
  });

  // 8. flows.ts (only if hasQuiz)
  if (input.hasQuiz) {
    patches.push({
      file: "src/framework/flows.ts",
      description: `Add F-${input.code}-Welcome-Quiz flow`,
      snippet: `  {
    id: "F-${input.code}-Welcome-Quiz",
    name: "${input.name} Quiz Nurture",
    category: "entry",
    trigger: "Completed ${input.name.toLowerCase()} quiz",
    emailCount: 11,
    tieredByPrice: false,
    description: "45-day nurture: educate, build trust, convert",
    status: "planned",
  },`,
      insertAfter: "// Add new quiz flows above this line",
    });

    // Quiz lead list
    patches.push({
      file: "src/framework/lists.ts",
      description: `Add L-${input.code}-Quiz-Leads list`,
      snippet: `  { id: "L-${input.code}-Quiz-Leads", name: "${input.name} Quiz Leads", type: "quiz", entryCriteria: "Completed ${input.name.toLowerCase()} quiz" },`,
      insertAfter: "// Add new quiz lists above this line",
    });
  }

  return patches;
}

function buildSummary(input: NewCategoryInput): string {
  const assets = [
    `Category: ${input.code} — ${input.name}`,
    `Products: ${input.keyProducts.join(", ")}`,
    `Content: ${input.articleCount} articles, ${input.contentAreas.length} content areas`,
    `List: L-${input.code}-Subscribers`,
    `Segment: S-INT-${input.name.replace(/\s+/g, "")}`,
  ];

  if (input.hasQuiz) {
    assets.push(
      `Flow: F-${input.code}-Welcome-Quiz (11 emails, 45 days)`,
      `Quiz List: L-${input.code}-Quiz-Leads`,
      `Templates: T-${input.code}-Nurture-E1 through E11`
    );
  }

  assets.push(
    `Cross-sells: ${input.crossSellCategories.join(", ")}`,
    `Goals: ${input.goalBoosts.join(", ")}`,
    `Classifier: ${input.classifierKeywords.length} keywords`
  );

  return assets.join("\n");
}
