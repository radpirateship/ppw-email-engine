// ============================================================================
// Category Completion Scoring Engine
// Cross-references the framework plan against live Klaviyo state
// ============================================================================

import { CATEGORIES, type Category } from "./categories";
import { ALL_FLOWS } from "./flows";
import { ALL_LISTS } from "./lists";
import { ALL_SEGMENTS } from "./segments";
import { CATEGORY_CONTENT } from "./content-map";
import {
  LIVE_FLOWS,
  LIVE_LISTS,
  LIVE_SEGMENTS,
  QUIZ_METRICS,
  KLAVIYO_SNAPSHOT,
  type KlaviyoFlow,
} from "./klaviyo-state";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CategoryFlowStatus {
  /** Framework flow type */
