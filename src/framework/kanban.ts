// ============================================================================
// PPW Email Engine — Kanban Task Board
// Auto-generates TODO items from flow definitions, onboarding steps, and
// provides a visual Kanban board for tracking implementation progress.
// ============================================================================

import { ALL_FLOWS, type FlowDefinition } from "./flows";
import { ALL_STEPS, type OnboardingStep } from "./onboarding";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type KanbanColumn = "backlog" | "todo" | "in-progress" | "done";

export type TaskPriority = "critical" | "high" | "medium" | "low";

export type TaskSource =
  | "auto-flow"        // Generated from flow definitions
  | "auto-onboarding"  // Generated from onboarding steps
  | "auto-prerequisite" // Generated from flow prerequisites (discounts, lists, etc.)
  | "manual";          // User-created

export type TaskCategory =
  | "klaviyo-setup"    // Lists, segments, tags
  | "flow-build"       // Building flows in Klaviyo
  | "discount-setup"   // Creating discount codes in Klaviyo/Shopify
  | "content-create"   // Writing email copy
  | "integration"      // Connecting systems (popups, etc.)
  | "testing"          // QA and testing
  | "optimization"     // A/B tests, send time, etc.
  | "general";         // Other tasks

export interface KanbanTask {
  id: string;
  title: string;
  description: string;
  column: KanbanColumn;
  priority: TaskPriority;
  source: TaskSource;
  category: TaskCategory;
  /** Related flow ID if applicable */
  flowId?: string;
  /** Related onboarding step ID if applicable */
  onboardingStepId?: string;
  /** Tags for filtering */
  tags: string[];
  /** Estimated minutes */
  estimatedMinutes?: number;
  /** IDs of tasks that must be done first */
  blockedBy: string[];
  /** When the task was created */
  createdAt: string;
  /** When the task was last updated */
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Column definitions
// ---------------------------------------------------------------------------

export interface ColumnDef {
  id: KanbanColumn;
  label: string;
  description: string;
  color: string;
  icon: string;
}

export const COLUMNS: ColumnDef[] = [
  {
    id: "backlog",
    label: "Backlog",
    description: "Identified but not yet scheduled",
    color: "gray",
    icon: "📋",
  },
  {
    id: "todo",
    label: "To Do",
    description: "Scheduled — ready to start",
    color: "blue",
    icon: "📌",
  },
  {
    id: "in-progress",
    label: "In Progress",
    description: "Currently being worked on",
    color: "amber",
    icon: "🔨",
  },
  {
    id: "done",
    label: "Done",
    description: "Completed and verified",
    color: "green",
    icon: "✅",
  },
];

// ---------------------------------------------------------------------------
// Auto-generated tasks from flow definitions
// ---------------------------------------------------------------------------

/**
 * Scan flow definitions for elements that require prerequisite setup,
 * such as discount codes, specific lists, segments, etc.
 */
function detectFlowPrerequisites(flow: FlowDefinition): KanbanTask[] {
  const tasks: KanbanTask[] = [];
  const now = new Date().toISOString();

  // Flows that are tiered by price need price tier segments
  if (flow.tieredByPrice) {
    tasks.push({
      id: `auto-prereq-tiers-${flow.id}`,
      title: `Create price tier segments for ${flow.name}`,
      description: `${flow.name} is tiered by cart/checkout value. Create conditional splits or segments for Entry ($0-499), Mid ($500-1999), and High ($2000+) tiers in Klaviyo.`,
      column: "backlog",
      priority: "high",
      source: "auto-prerequisite",
      category: "klaviyo-setup",
      flowId: flow.id,
      tags: ["segments", "price-tiers", "klaviyo"],
      estimatedMinutes: 20,
      blockedBy: [],
      createdAt: now,
      updatedAt: now,
    });
  }

  // Cart/checkout abandon flows need discount codes for high-value recovery
  if (flow.id === "F-ALL-Cart-Abandon" || flow.id === "F-ALL-Checkout-Abandon") {
    tasks.push({
      id: `auto-prereq-discount-${flow.id}`,
      title: `Create recovery discount code for ${flow.name}`,
      description: `Set up a unique discount code in Shopify for the ${flow.name} flow. Suggested: 5-10% off for mid-tier, free shipping or consultation for high-tier. Create the code in Shopify Admin → Discounts, then reference it in the Klaviyo flow emails.`,
      column: "backlog",
      priority: "high",
      source: "auto-prerequisite",
      category: "discount-setup",
      flowId: flow.id,
      tags: ["discount", "shopify", "klaviyo", "recovery"],
      estimatedMinutes: 15,
      blockedBy: [],
      createdAt: now,
      updatedAt: now,
    });
  }

  // Accessory upsell flows need discount codes
  if (flow.id.includes("Accessory-Upsell")) {
    tasks.push({
      id: `auto-prereq-discount-${flow.id}`,
      title: `Create accessory bundle discount for ${flow.name}`,
      description: `Create a discount code in Shopify for accessory bundle offers in the ${flow.name} flow. Suggested: 10-15% off accessory purchases when customer already owns the main product.`,
      column: "backlog",
      priority: "medium",
      source: "auto-prerequisite",
      category: "discount-setup",
      flowId: flow.id,
      tags: ["discount", "shopify", "upsell", "accessories"],
      estimatedMinutes: 10,
      blockedBy: [],
      createdAt: now,
      updatedAt: now,
    });
  }

  // Winback flows need a re-engagement offer
  if (flow.id.includes("Winback")) {
    tasks.push({
      id: `auto-prereq-discount-${flow.id}`,
      title: `Create winback offer/discount for ${flow.name}`,
      description: `Create a special winback discount code in Shopify for the ${flow.name} flow. Suggested: exclusive comeback offer (10-20% off or special bundle deal) to re-engage lapsed customers.`,
      column: "backlog",
      priority: "medium",
      source: "auto-prerequisite",
      category: "discount-setup",
      flowId: flow.id,
      tags: ["discount", "shopify", "winback", "lifecycle"],
      estimatedMinutes: 10,
      blockedBy: [],
      createdAt: now,
      updatedAt: now,
    });
  }

  // VIP nurture needs referral program setup
  if (flow.id === "F-ALL-VIP-Nurture") {
    tasks.push({
      id: `auto-prereq-referral-${flow.id}`,
      title: "Set up VIP referral program",
      description: "Create a referral program or VIP-exclusive discount code for the VIP Nurture flow. This could be a dedicated referral link, exclusive early-access code, or tiered VIP rewards.",
      column: "backlog",
      priority: "medium",
      source: "auto-prerequisite",
      category: "integration",
      flowId: flow.id,
      tags: ["vip", "referral", "loyalty"],
      estimatedMinutes: 30,
      blockedBy: [],
      createdAt: now,
      updatedAt: now,
    });
  }

  // Quiz nurture flows need the quiz list to exist
  if (flow.id.includes("Welcome-Quiz")) {
    const categoryCode = flow.id.split("-")[1]; // e.g., "SAU" from "F-SAU-Welcome-Quiz"
    tasks.push({
      id: `auto-prereq-quiz-list-${flow.id}`,
      title: `Create quiz completion list for ${flow.name}`,
      description: `Create the Klaviyo list that the ${categoryCode} quiz feeds subscribers into. Name: L-QUIZ-${categoryCode}-Finder. This list triggers the ${flow.name} nurture sequence.`,
      column: "backlog",
      priority: "high",
      source: "auto-prerequisite",
      category: "klaviyo-setup",
      flowId: flow.id,
      tags: ["lists", "quiz", "klaviyo", categoryCode.toLowerCase()],
      estimatedMinutes: 10,
      blockedBy: [],
      createdAt: now,
      updatedAt: now,
    });
  }

  return tasks;
}

/**
 * Generate a "build this flow" task for each flow definition.
 */
function generateFlowBuildTasks(): KanbanTask[] {
  const now = new Date().toISOString();
  const priorityMap: Record<string, TaskPriority> = {
    "entry": "high",
    "engagement": "critical",
    "post-purchase": "high",
    "lifecycle": "medium",
  };

  return ALL_FLOWS.map((flow) => ({
    id: `auto-flow-build-${flow.id}`,
    title: `Build flow: ${flow.name}`,
    description: `Create the ${flow.name} flow in Klaviyo. ${flow.description}. Trigger: ${flow.trigger}. Emails: ${flow.emailCount}.`,
    column: "backlog" as KanbanColumn,
    priority: priorityMap[flow.category] ?? "medium",
    source: "auto-flow" as TaskSource,
    category: "flow-build" as TaskCategory,
    flowId: flow.id,
    tags: [flow.category, "flow", "klaviyo"],
    estimatedMinutes: flow.emailCount * 15 + 30, // rough estimate
    blockedBy: [],
    createdAt: now,
    updatedAt: now,
  }));
}

/**
 * Generate all prerequisite tasks from all flows.
 */
function generatePrerequisiteTasks(): KanbanTask[] {
  return ALL_FLOWS.flatMap(detectFlowPrerequisites);
}

/**
 * Foundation setup tasks that don't come from flows.
 */
function generateFoundationTasks(): KanbanTask[] {
  const now = new Date().toISOString();
  return [
    {
      id: "auto-foundation-master-lists",
      title: "Create master email & SMS lists",
      description: "Create L-ALL-Master-Email and L-ALL-Master-SMS in Klaviyo. These are the top-level subscriber lists all other lists flow into.",
      column: "backlog",
      priority: "critical",
      source: "auto-onboarding",
      category: "klaviyo-setup",
      onboardingStepId: "F02-create-master-lists",
      tags: ["lists", "klaviyo", "foundation"],
      estimatedMinutes: 15,
      blockedBy: [],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "auto-foundation-category-lists",
      title: "Create category subscriber lists",
      description: "Create category-specific subscriber lists (L-SAU-Subscribers, L-CLD-Subscribers, etc.) for your top 3-5 priority categories.",
      column: "backlog",
      priority: "critical",
      source: "auto-onboarding",
      category: "klaviyo-setup",
      onboardingStepId: "F03-create-category-lists",
      tags: ["lists", "klaviyo", "categories", "foundation"],
      estimatedMinutes: 20,
      blockedBy: ["auto-foundation-master-lists"],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "auto-foundation-exclusion-lists",
      title: "Create exclusion/suppression lists",
      description: "Create L-EXCLUDE-Purchased, L-EXCLUDE-Unengaged, and L-EXCLUDE-Complained in Klaviyo for proper suppression.",
      column: "backlog",
      priority: "high",
      source: "auto-onboarding",
      category: "klaviyo-setup",
      onboardingStepId: "F04-create-exclusion-lists",
      tags: ["lists", "klaviyo", "exclusions", "foundation"],
      estimatedMinutes: 15,
      blockedBy: ["auto-foundation-master-lists"],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "auto-foundation-tags",
      title: "Set up tag taxonomy",
      description: "Create the 7-category tag system in Klaviyo: cat:, brand:, tier:, source:, quiz:, engage:, stage: prefixes.",
      column: "backlog",
      priority: "high",
      source: "auto-onboarding",
      category: "klaviyo-setup",
      onboardingStepId: "F05-setup-tags",
      tags: ["tags", "klaviyo", "organization", "foundation"],
      estimatedMinutes: 25,
      blockedBy: [],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "auto-foundation-segments",
      title: "Create core behavioral segments",
      description: "Build must-have segments: S-BHV-Hot-Leads-30d, S-BHV-Warm-Leads-90d, S-CUS-VIP, S-CUS-Recent-Purchasers, S-CUS-Repeat-Buyers.",
      column: "backlog",
      priority: "high",
      source: "auto-onboarding",
      category: "klaviyo-setup",
      onboardingStepId: "F06-create-core-segments",
      tags: ["segments", "klaviyo", "behavioral", "foundation"],
      estimatedMinutes: 30,
      blockedBy: ["auto-foundation-master-lists"],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "auto-foundation-popups",
      title: "Connect website popups to Klaviyo lists",
      description: "Ensure Shopify popups feed into correct master and category lists. Connect quiz completion triggers to quiz-specific lists.",
      column: "backlog",
      priority: "high",
      source: "auto-onboarding",
      category: "integration",
      onboardingStepId: "F07-connect-popups",
      tags: ["popups", "forms", "integration", "foundation"],
      estimatedMinutes: 30,
      blockedBy: ["auto-foundation-category-lists"],
      createdAt: now,
      updatedAt: now,
    },
  ];
}

// ---------------------------------------------------------------------------
// Generate all auto tasks
// ---------------------------------------------------------------------------

export function generateAllAutoTasks(): KanbanTask[] {
  return [
    ...generateFoundationTasks(),
    ...generatePrerequisiteTasks(),
    ...generateFlowBuildTasks(),
  ];
}

// ---------------------------------------------------------------------------
// localStorage persistence
// ---------------------------------------------------------------------------

const KANBAN_STORAGE_KEY = "ppw-kanban-tasks";

export function loadKanbanTasks(): KanbanTask[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KANBAN_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveKanbanTasks(tasks: KanbanTask[]) {
  localStorage.setItem(KANBAN_STORAGE_KEY, JSON.stringify(tasks));
}

/**
 * Merge auto-generated tasks with saved tasks.
 * - New auto tasks that don't exist in saved → add them
 * - Saved tasks that match auto IDs → keep saved column/state
 * - Manual tasks → always keep
 */
export function mergeWithAutoTasks(savedTasks: KanbanTask[]): KanbanTask[] {
  const autoTasks = generateAllAutoTasks();
  const savedById = new Map(savedTasks.map((t) => [t.id, t]));
  const merged: KanbanTask[] = [];

  // Add auto tasks, preserving saved state if exists
  for (const auto of autoTasks) {
    const saved = savedById.get(auto.id);
    if (saved) {
      // Keep the saved version (preserves column, priority changes, etc.)
      merged.push(saved);
      savedById.delete(auto.id);
    } else {
      // New auto task — add it
      merged.push(auto);
    }
  }

  // Add remaining manual tasks
  for (const [, task] of savedById) {
    if (task.source === "manual") {
      merged.push(task);
    }
    // Orphaned auto tasks (from removed flows) are dropped
  }

  return merged;
}

// ---------------------------------------------------------------------------
// Task helpers
// ---------------------------------------------------------------------------

export function getTasksByColumn(tasks: KanbanTask[], column: KanbanColumn): KanbanTask[] {
  return tasks
    .filter((t) => t.column === column)
    .sort((a, b) => {
      const priorityOrder: Record<TaskPriority, number> = { critical: 0, high: 1, medium: 2, low: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
}

export function getTaskStats(tasks: KanbanTask[]) {
  const byColumn: Record<KanbanColumn, number> = {
    backlog: 0,
    todo: 0,
    "in-progress": 0,
    done: 0,
  };
  const byCategory: Record<TaskCategory, number> = {
    "klaviyo-setup": 0,
    "flow-build": 0,
    "discount-setup": 0,
    "content-create": 0,
    integration: 0,
    testing: 0,
    optimization: 0,
    general: 0,
  };
  const byPriority: Record<TaskPriority, number> = {
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
  };

  let totalMinutes = 0;
  let doneMinutes = 0;

  for (const task of tasks) {
    byColumn[task.column]++;
    byCategory[task.category]++;
    byPriority[task.priority]++;
    if (task.estimatedMinutes) {
      totalMinutes += task.estimatedMinutes;
      if (task.column === "done") {
        doneMinutes += task.estimatedMinutes;
      }
    }
  }

  const discountTasks = tasks.filter((t) => t.category === "discount-setup");
  const discountDone = discountTasks.filter((t) => t.column === "done").length;

  return {
    total: tasks.length,
    byColumn,
    byCategory,
    byPriority,
    totalMinutes,
    doneMinutes,
    remainingMinutes: totalMinutes - doneMinutes,
    completionPercentage: tasks.length > 0 ? Math.round((byColumn.done / tasks.length) * 100) : 0,
    discountTasks: discountTasks.length,
    discountDone,
  };
}

export function moveTask(tasks: KanbanTask[], taskId: string, newColumn: KanbanColumn): KanbanTask[] {
  return tasks.map((t) =>
    t.id === taskId ? { ...t, column: newColumn, updatedAt: new Date().toISOString() } : t
  );
}

export function updateTaskPriority(tasks: KanbanTask[], taskId: string, priority: TaskPriority): KanbanTask[] {
  return tasks.map((t) =>
    t.id === taskId ? { ...t, priority, updatedAt: new Date().toISOString() } : t
  );
}

export function addManualTask(
  tasks: KanbanTask[],
  title: string,
  description: string,
  category: TaskCategory = "general",
  priority: TaskPriority = "medium"
): KanbanTask[] {
  const now = new Date().toISOString();
  const id = `manual-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  return [
    ...tasks,
    {
      id,
      title,
      description,
      column: "todo",
      priority,
      source: "manual",
      category,
      tags: ["manual"],
      blockedBy: [],
      createdAt: now,
      updatedAt: now,
    },
  ];
}

export function deleteTask(tasks: KanbanTask[], taskId: string): KanbanTask[] {
  return tasks.filter((t) => t.id !== taskId);
}
