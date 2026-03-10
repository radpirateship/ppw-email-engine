// ============================================================================
// PPW Email Engine — Naming Conventions
// ============================================================================

export type AssetType = "flow" | "campaign" | "list" | "segment" | "template";

export interface AssetPrefix {
  type: AssetType;
  prefix: string;
  pattern: string;
  example: string;
}

export const ASSET_PREFIXES: Record<AssetType, AssetPrefix> = {
  flow: {
    type: "flow",
    prefix: "F-",
    pattern: "F-[CATEGORY]-[Purpose]-[Variation]",
    example: "F-SAU-Welcome-Quiz",
  },
  campaign: {
    type: "campaign",
    prefix: "C-",
    pattern: "C-[CATEGORY]-[Campaign-Name]-[Date]",
    example: "C-SAU-Holiday-Sale",
  },
  list: {
    type: "list",
    prefix: "L-",
    pattern: "L-[CATEGORY]-[Type]",
    example: "L-SAU-Subscribers",
  },
  segment: {
    type: "segment",
    prefix: "S-",
    pattern: "S-[Type]-[Criteria]",
    example: "S-HOT-Checkout-Abandon-7d",
  },
  template: {
    type: "template",
    prefix: "T-",
    pattern: "T-[CATEGORY]-[Flow]-[Email#]",
    example: "T-SAU-Welcome-E1",
  },
} as const;

/**
 * Generate a properly formatted asset name.
 * Use "ALL" as the category code for cross-category assets.
 */
export function buildAssetName(
  type: AssetType,
  categoryCode: string,
  purpose: string,
  variation?: string
): string {
  const prefix = ASSET_PREFIXES[type].prefix;
  const parts = [prefix + categoryCode, purpose];
  if (variation) parts.push(variation);
  return parts.join("-");
}

/**
 * Validate that a name follows the PPW naming convention.
 */
export function validateAssetName(name: string): {
  valid: boolean;
  type?: AssetType;
  error?: string;
} {
  const prefixMap: Record<string, AssetType> = {
    "F-": "flow",
    "C-": "campaign",
    "L-": "list",
    "S-": "segment",
    "T-": "template",
  };

  const matchedPrefix = Object.keys(prefixMap).find((p) =>
    name.startsWith(p)
  );

  if (!matchedPrefix) {
    return {
      valid: false,
      error: `Name must start with a valid prefix: ${Object.keys(prefixMap).join(", ")}`,
    };
  }

  const parts = name.slice(2).split("-");
  if (parts.length < 2) {
    return {
      valid: false,
      type: prefixMap[matchedPrefix],
      error: "Name must include at least a category code and purpose",
    };
  }

  return { valid: true, type: prefixMap[matchedPrefix] };
    }
