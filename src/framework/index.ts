// ============================================================================
// PPW Email Engine — Framework Barrel Export
// ============================================================================

export * from "./categories";
export * from "./price-tiers";
export * from "./naming";
export * from "./tags";
export * from "./flows";
export * from "./segments";
export * from "./lists";
export * from "./content-map";
export * from "./klaviyo-state";
export * from "./completion";
export * from "./classifier";
export * from "./email-templates";
export * from "./flow-dashboard";
export {
  type Product,
  PRODUCTS,
  CATALOG_STATS,
  getProductById,
  getProductsByCategory,
  getProductsByVendor,
  getProductsByPriceTier,
  getTopRatedProducts,
} from "./product-catalog";
export {
  type QuizProfile,
  type Recommendation,
  type RecommendationSet,
  generateRecommendations,
  getCategoryProductSummary,
  getComplementaryProducts,
  toKlaviyoDynamicBlock,
} from "./recommendation-engine";
