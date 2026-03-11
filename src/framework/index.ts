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
export {
  type KlaviyoFlow,
  type KlaviyoList,
  type KlaviyoSegment,
  type QuizMetric,
  type KlaviyoMetricSummary,
  LIVE_FLOWS,
  LIVE_LISTS,
  LIVE_SEGMENTS,
  QUIZ_METRICS,
  KEY_METRICS,
  KLAVIYO_SNAPSHOT,
  getFlowsByStatus,
  getListsByCategory,
  getMetricId,
} from "./klaviyo-state";
export * from "./completion";
export * from "./classifier";
export * from "./email-templates";
export * from "./flow-dashboard";
export {
  type CategoryDelta,
  type OrphanedItem,
  type DeltaSummary,
  buildDeltaSummary,
} from "./klaviyo-delta";
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
