"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import {
  CATEGORIES,
  CATEGORY_CODES,
} from "@/framework/categories";
import {
  loadPushRecords,
  savePushRecord,
  markPushRecordLive,
  type StoredPushRecord,
} from "@/framework/template-push-store";
import {
  saveOverride,
} from "@/framework/collection-hub";
import {
  loadKanbanTasks,
  saveKanbanTasks,
} from "@/framework/kanban";
import {
  FLOW_TYPES,
  getFlowType,
  getFlowIdForType,
  getTemplateNameForType,
  type FlowTypeDefinition,
} from "@/framework/flow-email-positions";
import {
  loadEmailSet,
  saveEmailSet,
  type StoredEmail,
  type StoredEmailSet,
} from "@/framework/email-store";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Tone = "professional" | "friendly" | "urgent" | "educational";

interface GeneratedEmail {
  subject: string;
  previewText: string;
  htmlBody: string;
  plainText: string;
  position: string;
  day: number;
  categoryCode: string;
  categoryName: string;
  purpose: string;
  templateName: string;
  generatedAt: string;
  variationSeed: number;
}

// Legacy template format from old /api/copy-generator
interface LegacyTemplate {
  templateName: string;
  position: string;
  day: number;
  categoryCode: string;
  categoryName: string;
  subject: string;
  previewText: string;
  htmlBody: string;
  plainText: string;
  variables: Array<{ tag: string; description: string; example: string }>;
  conditionals: Array<{ condition: string; description: string; trueContent: string; falseContent?: string }>;
  purpose: string;
}

// Unified display type
interface DisplayEmail {
  subject: string;
  previewText: string;
  htmlBody: string;
  plainText: string;
  position: string;
  day: number;
  categoryCode: string;
  categoryName: string;
  purpose: string;
  templateName: string;
  generatedAt?: string;
  variationSeed?: number;
  isAI: boolean;
}

type PushState = "idle" | "pushing" | "pushed" | "error";

interface PushStatus {
  state: PushState;
  klaviyoTemplateId?: string;
  editUrl?: string;
  error?: string;
}

// ---------------------------------------------------------------------------
// Quiz-enabled categories (for quiz-nurture flow)
// ---------------------------------------------------------------------------

const QUIZ_CATEGORIES = ["SAU", "CLD", "RLT", "HYP", "H2O", "REC", "PIL", "GYM"];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function CopyGeneratorPage() {
  // Flow type selection (NEW)
  const [selectedFlowType, setSelectedFlowType] = useState("quiz-nurture");
  const flowDef = getFlowType(selectedFlowType) as FlowTypeDefinition;

  // Selection state
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedPosition, setSelectedPosition] = useState("ALL");

  // AI generation options
  const [tone, setTone] = useState<Tone>("friendly");
  const [additionalContext, setAdditionalContext] = useState("");
  const [useAI, setUseAI] = useState(true);

  // Results state
  const [emails, setEmails] = useState<DisplayEmail[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingPosition, setLoadingPosition] = useState<string | null>(null);
  const [error, setError] = useState("");

  // UI state
  const [expandedEmail, setExpandedEmail] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"preview" | "html" | "text" | "edit">("preview");

  // Editable content (per position)
  const [editedSubjects, setEditedSubjects] = useState<Record<string, string>>({});
  const [editedPreviews, setEditedPreviews] = useState<Record<string, string>>({});
  const [editedHtml, setEditedHtml] = useState<Record<string, string>>({});
  const [editedPlainText, setEditedPlainText] = useState<Record<string, string>>({});
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Klaviyo push state (per position)
  const [pushStatuses, setPushStatuses] = useState<Record<string, PushStatus>>({});
  const [pushRecords, setPushRecords] = useState<StoredPushRecord[]>([]);
  const [showInstructions, setShowInstructions] = useState<string | null>(null);

  // Ref to track whether persistence save is needed
  const persistTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load push records on mount
  useEffect(() => {
    setPushRecords(loadPushRecords());
  }, []);

  // Determine the effective category code for storage
  const effectiveCategoryCode = flowDef?.requiresCategory
    ? selectedCategory
    : "ALL";

  // ---------------------------------------------------------------------------
  // Load persisted emails when flow type or category changes
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (!flowDef) return;
    if (flowDef.requiresCategory && !selectedCategory) return;

    const stored = loadEmailSet(selectedFlowType, effectiveCategoryCode);
    if (stored && stored.emails.length > 0) {
      // Restore emails
      setEmails(
        stored.emails.map((e) => ({
          ...e,
          isAI: e.isAI ?? true,
        }))
      );
      setEditedSubjects(stored.editedSubjects || {});
      setEditedPreviews(stored.editedPreviews || {});
      setEditedHtml(stored.editedHtml || {});
      setEditedPlainText(stored.editedPlainText || {});
    } else {
      // No stored data — clear state
      setEmails([]);
      setEditedSubjects({});
      setEditedPreviews({});
      setEditedHtml({});
      setEditedPlainText({});
    }
    setExpandedEmail(null);
    setPushStatuses({});
    setShowInstructions(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFlowType, selectedCategory]);

  // ---------------------------------------------------------------------------
  // Auto-save to localStorage when emails or edits change (debounced)
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (emails.length === 0) return;
    if (!flowDef) return;
    if (flowDef.requiresCategory && !selectedCategory) return;

    if (persistTimerRef.current) clearTimeout(persistTimerRef.current);
    persistTimerRef.current = setTimeout(() => {
      const storedEmails: StoredEmail[] = emails.map((e) => ({
        subject: e.subject,
        previewText: e.previewText,
        htmlBody: e.htmlBody,
        plainText: e.plainText,
        position: e.position,
        day: e.day,
        categoryCode: e.categoryCode,
        categoryName: e.categoryName,
        purpose: e.purpose,
        templateName: e.templateName,
        generatedAt: e.generatedAt,
        variationSeed: e.variationSeed,
        isAI: e.isAI,
      }));

      saveEmailSet(selectedFlowType, effectiveCategoryCode, {
        flowTypeId: selectedFlowType,
        categoryCode: effectiveCategoryCode,
        emails: storedEmails,
        editedSubjects,
        editedPreviews,
        editedHtml,
        editedPlainText,
      });
    }, 500);

    return () => {
      if (persistTimerRef.current) clearTimeout(persistTimerRef.current);
    };
  }, [emails, editedSubjects, editedPreviews, editedHtml, editedPlainText, selectedFlowType, effectiveCategoryCode, flowDef, selectedCategory]);

  // ---------------------------------------------------------------------------
  // Reset position when flow type changes
  // ---------------------------------------------------------------------------

  const handleFlowTypeChange = (newFlowType: string) => {
    setSelectedFlowType(newFlowType);
    setSelectedPosition("ALL");
    setError("");
    // Category reset handled if new flow doesn't require it
    const newDef = getFlowType(newFlowType);
    if (newDef && !newDef.requiresCategory) {
      setSelectedCategory("ALL");
    } else if (newDef && newDef.requiresCategory && selectedCategory === "ALL") {
      setSelectedCategory("");
    }
  };

  // -------------------------------------------------------------------------
  // AI Generation (single position)
  // -------------------------------------------------------------------------

  const generateAI = useCallback(
    async (position: string, seed?: number) => {
      const variationSeed = seed ?? Math.floor(Math.random() * 10000);
      const catCode = flowDef?.requiresCategory ? selectedCategory : "ALL";
      const cat = CATEGORIES[catCode as keyof typeof CATEGORIES];
      if (!cat && flowDef?.requiresCategory) return;

      // For non-category flows, use a generic fallback
      const categoryName = cat?.name || "All Categories";
      const keyProducts = cat?.keyProducts || [];
      const articleCount = cat?.articleCount || 0;

      const res = await fetch("/api/generate-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          categoryCode: catCode,
          position,
          flowType: selectedFlowType,
          tone,
          additionalContext: additionalContext || undefined,
          variationSeed,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "AI generation failed");

      const email: GeneratedEmail = data.email;
      return {
        subject: email.subject,
        previewText: email.previewText,
        htmlBody: email.htmlBody,
        plainText: email.plainText,
        position: email.position,
        day: email.day,
        categoryCode: email.categoryCode,
        categoryName: email.categoryName,
        purpose: email.purpose,
        templateName: email.templateName,
        generatedAt: email.generatedAt,
        variationSeed: email.variationSeed,
        isAI: true,
      } as DisplayEmail;
    },
    [selectedCategory, selectedFlowType, flowDef, tone, additionalContext]
  );

  // -------------------------------------------------------------------------
  // Legacy generation (template-based) — only for quiz-nurture
  // -------------------------------------------------------------------------

  const generateLegacy = useCallback(async () => {
    const params = new URLSearchParams({ category: selectedCategory });
    if (selectedPosition !== "ALL") {
      params.set("position", selectedPosition);
    }

    const res = await fetch(`/api/copy-generator?${params.toString()}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Generation failed");

    return (data.templates as LegacyTemplate[]).map(
      (t): DisplayEmail => ({
        subject: t.subject,
        previewText: t.previewText,
        htmlBody: t.htmlBody,
        plainText: t.plainText,
        position: t.position,
        day: t.day,
        categoryCode: t.categoryCode,
        categoryName: t.categoryName,
        purpose: t.purpose,
        templateName: t.templateName,
        isAI: false,
      })
    );
  }, [selectedCategory, selectedPosition]);

  // -------------------------------------------------------------------------
  // Main generate handler
  // -------------------------------------------------------------------------

  const handleGenerate = async () => {
    if (flowDef?.requiresCategory && !selectedCategory) {
      setError("Please select a category.");
      return;
    }
    setError("");
    setLoading(true);
    setEmails([]);
    setEditedSubjects({});
    setEditedPreviews({});
    setEditedHtml({});
    setEditedPlainText({});

    try {
      if (useAI) {
        // Determine which positions to generate
        const positions =
          selectedPosition === "ALL"
            ? flowDef.positions.map((p) => p.position)
            : [selectedPosition];

        const results: DisplayEmail[] = [];
        for (const pos of positions) {
          setLoadingPosition(pos);
          try {
            const email = await generateAI(pos);
            if (email) {
              results.push(email);
              setEmails([...results]);
            }
          } catch (err) {
            console.error(`Failed to generate ${pos}:`, err);
            // Continue with remaining positions
          }
        }
        setLoadingPosition(null);

        if (results.length === 0) {
          setError(
            "AI generation failed. Make sure ANTHROPIC_API_KEY is set in Vercel environment variables. You can also try the template-based generator below."
          );
        } else if (results.length === 1) {
          setExpandedEmail(results[0].position);
        }
      } else {
        const results = await generateLegacy();
        setEmails(results);
        if (results.length === 1) {
          setExpandedEmail(results[0].position);
        }
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to generate. Please try again."
      );
    } finally {
      setLoading(false);
      setLoadingPosition(null);
    }
  };

  // -------------------------------------------------------------------------
  // Regenerate a single position with a new variation
  // -------------------------------------------------------------------------

  const handleRegenerate = async (position: string) => {
    setLoadingPosition(position);
    setError("");
    try {
      const email = await generateAI(position);
      if (email) {
        setEmails((prev) =>
          prev.map((e) => (e.position === position ? email : e))
        );
        // Clear any edits for this position
        setEditedSubjects((prev) => {
          const next = { ...prev };
          delete next[position];
          return next;
        });
        setEditedPreviews((prev) => {
          const next = { ...prev };
          delete next[position];
          return next;
        });
        setEditedHtml((prev) => {
          const next = { ...prev };
          delete next[position];
          return next;
        });
        setEditedPlainText((prev) => {
          const next = { ...prev };
          delete next[position];
          return next;
        });
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : `Failed to regenerate ${position}`
      );
    } finally {
      setLoadingPosition(null);
    }
  };

  // -------------------------------------------------------------------------
  // Push to Klaviyo handler
  // -------------------------------------------------------------------------

  const handlePushToKlaviyo = async (email: DisplayEmail) => {
    const key = email.position;
    setPushStatuses((prev) => ({
      ...prev,
      [key]: { state: "pushing" },
    }));

    try {
      const res = await fetch("/api/klaviyo/push-template", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: email.templateName,
          html: getHtml(email),
          categoryCode: email.categoryCode,
          position: email.position,
          subject: getSubject(email),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setPushStatuses((prev) => ({
          ...prev,
          [key]: {
            state: "error",
            error: data.error || "Push failed",
          },
        }));
        return;
      }

      // Save push record to localStorage
      const record: StoredPushRecord = {
        templateName: email.templateName,
        categoryCode: email.categoryCode,
        position: email.position,
        subject: getSubject(email),
        klaviyoTemplateId: data.klaviyoTemplateId,
        editUrl: data.editUrl,
        status: "pushed",
        pushedAt: data.pushedAt,
      };
      savePushRecord(record);
      setPushRecords(loadPushRecords());

      setPushStatuses((prev) => ({
        ...prev,
        [key]: {
          state: "pushed",
          klaviyoTemplateId: data.klaviyoTemplateId,
          editUrl: data.editUrl,
        },
      }));

      // Show instructions automatically
      setShowInstructions(key);
    } catch (err) {
      setPushStatuses((prev) => ({
        ...prev,
        [key]: {
          state: "error",
          error: err instanceof Error ? err.message : "Network error",
        },
      }));
    }
  };

  // -------------------------------------------------------------------------
  // Mark as Live — updates flow status, kanban, and push record
  // -------------------------------------------------------------------------

  const handleMarkAsLive = (email: DisplayEmail) => {
    // 1. Update push record
    markPushRecordLive(email.categoryCode, email.position);
    setPushRecords(loadPushRecords());

    // 2. Update flow status override using flow-type-aware ID
    const flowId = getFlowIdForType(selectedFlowType, effectiveCategoryCode);
    if (flowId) {
      saveOverride(flowId, "live");
    }

    // 3. Move related kanban tasks to "done"
    try {
      const tasks = loadKanbanTasks();
      const updated = tasks.map((t) => {
        if (
          t.category === email.categoryCode &&
          (t.id.toLowerCase().includes(selectedFlowType) ||
            t.id.toLowerCase().includes(flowDef?.name?.toLowerCase()?.split(" ")[0] || "")) &&
          t.column !== "done"
        ) {
          return { ...t, column: "done" as const };
        }
        return t;
      });
      saveKanbanTasks(updated);
    } catch {
      // Kanban update is best-effort
    }

    // 4. Update the push status display
    setPushStatuses((prev) => ({
      ...prev,
      [email.position]: {
        ...prev[email.position],
        state: "pushed",
      },
    }));
  };

  // Check if a position was already pushed (from localStorage)
  const getExistingPush = (categoryCode: string, position: string) => {
    return pushRecords.find(
      (r) => r.categoryCode === categoryCode && r.position === position
    );
  };

  // -------------------------------------------------------------------------
  // Copy helper
  // -------------------------------------------------------------------------

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedField(label);
      setTimeout(() => setCopiedField(null), 2000);
    });
  };

  // -------------------------------------------------------------------------
  // Get display values (edited > original)
  // -------------------------------------------------------------------------

  const getSubject = (e: DisplayEmail) =>
    editedSubjects[e.position] ?? e.subject;
  const getPreview = (e: DisplayEmail) =>
    editedPreviews[e.position] ?? e.previewText;
  const getHtml = (e: DisplayEmail) =>
    editedHtml[e.position] ?? e.htmlBody;
  const getPlainText = (e: DisplayEmail) =>
    editedPlainText[e.position] ?? e.plainText;

  const hasEdits = (e: DisplayEmail) =>
    editedSubjects[e.position] !== undefined ||
    editedPreviews[e.position] !== undefined ||
    editedHtml[e.position] !== undefined ||
    editedPlainText[e.position] !== undefined;

  // -------------------------------------------------------------------------
  // Derived values for the selected flow type
  // -------------------------------------------------------------------------

  const totalPositions = flowDef?.positions.length ?? 0;
  const positionRange = flowDef
    ? `${flowDef.positions[0]?.position}–${flowDef.positions[flowDef.positions.length - 1]?.position}`
    : "";

  // Determine which categories to show based on flow type
  const availableCategories = flowDef?.requiresCategory
    ? selectedFlowType === "quiz-nurture"
      ? QUIZ_CATEGORIES
      : CATEGORY_CODES
    : [];

  // Whether the "generate" button should be enabled
  const canGenerate =
    !loading &&
    (flowDef?.requiresCategory ? !!selectedCategory : true);

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  return (
    <div className="px-8 py-8 max-w-5xl">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Email Copy Generator
          </h1>
          {useAI && (
            <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-[10px] font-bold rounded-full uppercase tracking-wider">
              AI Powered
            </span>
          )}
        </div>
        <p className="text-sm text-gray-500 mt-1">
          {useAI
            ? `Generate unique, AI-written email content for your ${flowDef?.name || "email flow"}. Each generation produces fresh, category-specific content.`
            : `Generate Klaviyo-ready email copy from templates for the ${flowDef?.name || "email flow"}.`}
        </p>
      </div>

      {/* Controls */}
      <div className="bg-white border border-gray-200 rounded-lg p-5 mb-6 space-y-4">
        {/* Row 0: Flow Type Selector */}
        <div className="pb-4 border-b border-gray-100">
          <label className="block text-xs font-medium text-gray-600 mb-1.5">
            Flow Type
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {FLOW_TYPES.map((ft) => (
              <button
                key={ft.id}
                onClick={() => handleFlowTypeChange(ft.id)}
                className={`text-left px-3 py-2.5 rounded-lg border text-sm transition-all ${
                  selectedFlowType === ft.id
                    ? "border-green-500 bg-green-50 text-green-800 ring-2 ring-green-200"
                    : "border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                <p className="font-medium text-xs leading-tight">{ft.name}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">
                  {ft.positions.length} emails &middot;{" "}
                  {ft.requiresCategory ? "Per category" : "Universal"}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Row 1: Category + Position + Generate */}
        <div className="flex flex-wrap items-end gap-4">
          {/* Category selector — only show when flow type requires it */}
          {flowDef?.requiresCategory && (
            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-green-200 focus:border-green-400 outline-none"
              >
                <option value="">Select a category...</option>
                {availableCategories.map((code) => {
                  const cat = CATEGORIES[code as keyof typeof CATEGORIES];
                  return cat ? (
                    <option key={code} value={code}>
                      {code} — {cat.name}
                    </option>
                  ) : null;
                })}
              </select>
            </div>
          )}

          {/* Position selector — dynamically populated from flow type */}
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-medium text-gray-600 mb-1.5">
              Email Position
            </label>
            <select
              value={selectedPosition}
              onChange={(e) => setSelectedPosition(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-green-200 focus:border-green-400 outline-none"
            >
              <option value="ALL">
                All Positions ({positionRange}, {totalPositions} emails)
              </option>
              {flowDef?.positions.map((pos) => (
                <option key={pos.position} value={pos.position}>
                  {pos.position} — Day {pos.day}: {pos.purpose}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleGenerate}
            disabled={!canGenerate}
            className="px-6 py-2.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                {loadingPosition
                  ? `Generating ${loadingPosition}...`
                  : "Generating..."}
              </span>
            ) : useAI ? (
              "Generate with AI"
            ) : (
              "Generate from Templates"
            )}
          </button>
        </div>

        {/* Row 2: AI Options */}
        <div className="flex flex-wrap items-end gap-4 pt-3 border-t border-gray-100">
          {/* AI Toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setUseAI(!useAI)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                useAI ? "bg-purple-500" : "bg-gray-300"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  useAI ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
            <span className="text-xs font-medium text-gray-600">
              AI Generation {useAI ? "On" : "Off"}
            </span>
          </div>

          {/* Tone Selector (AI only) */}
          {useAI && (
            <div className="flex-1 min-w-[160px]">
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                Tone
              </label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value as Tone)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-200 focus:border-purple-400 outline-none"
              >
                <option value="friendly">Friendly & Warm</option>
                <option value="professional">Professional</option>
                <option value="educational">Educational & Detailed</option>
                <option value="urgent">Urgent / FOMO</option>
              </select>
            </div>
          )}

          {/* Additional Context (AI only) */}
          {useAI && (
            <div className="flex-[2] min-w-[250px]">
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                Additional Context{" "}
                <span className="text-gray-400">(optional)</span>
              </label>
              <input
                type="text"
                value={additionalContext}
                onChange={(e) => setAdditionalContext(e.target.value)}
                placeholder='e.g. "Focus on athletic recovery" or "Mention spring sale"'
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-200 focus:border-purple-400 outline-none"
              />
            </div>
          )}
        </div>

        {/* Persistence indicator */}
        {emails.length > 0 && (
          <div className="flex items-center gap-2 text-[10px] text-gray-400 pt-2">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Emails auto-saved — they&apos;ll persist across page refreshes
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {error}
          </div>
        )}
      </div>

      {/* Loading progress for all positions */}
      {loading && useAI && selectedPosition === "ALL" && (
        <div className="bg-white border border-gray-200 rounded-lg p-5 mb-6">
          <div className="flex items-center gap-3 mb-3">
            <svg className="animate-spin h-5 w-5 text-purple-500" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <p className="text-sm font-medium text-gray-700">
              Generating AI content — {emails.length} of {totalPositions} positions complete
            </p>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2">
            <div
              className="bg-purple-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${(emails.length / totalPositions) * 100}%` }}
            />
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            {flowDef?.positions.map((pos) => {
              const done = emails.some((e) => e.position === pos.position);
              const active = loadingPosition === pos.position;
              return (
                <span
                  key={pos.position}
                  className={`text-[10px] px-2 py-1 rounded-full font-medium ${
                    done
                      ? "bg-green-100 text-green-700"
                      : active
                      ? "bg-purple-100 text-purple-700 animate-pulse"
                      : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {pos.position}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Results */}
      {emails.length > 0 && (
        <>
          {/* Stats Bar */}
          <div className="flex gap-4 mb-4">
            <div className="bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-center flex-1">
              <p className="text-lg font-bold text-green-700">
                {emails.length}
              </p>
              <p className="text-[10px] text-gray-400">Emails</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-center flex-1">
              <p className="text-lg font-bold text-green-700">
                {effectiveCategoryCode}
              </p>
              <p className="text-[10px] text-gray-400">Category</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-center flex-1">
              <p className="text-lg font-bold text-green-700">
                {emails.filter((e) => e.isAI).length}
              </p>
              <p className="text-[10px] text-gray-400">AI Generated</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-center flex-1">
              <p className="text-lg font-bold text-green-700">
                {Object.keys(editedSubjects).length +
                  Object.keys(editedHtml).length}
              </p>
              <p className="text-[10px] text-gray-400">Edits Made</p>
            </div>
          </div>

          {/* View Mode Toggle */}
          <div className="flex gap-1 mb-4 bg-white border border-gray-200 rounded-lg p-1 w-fit">
            {(["preview", "html", "text", "edit"] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  viewMode === mode
                    ? mode === "edit"
                      ? "bg-purple-100 text-purple-700"
                      : "bg-green-100 text-green-700"
                    : "text-gray-500 hover:bg-gray-50"
                }`}
              >
                {mode === "preview"
                  ? "Preview"
                  : mode === "html"
                  ? "HTML"
                  : mode === "text"
                  ? "Plain Text"
                  : "Edit"}
              </button>
            ))}
          </div>

          {/* Email Cards */}
          <div className="space-y-3">
            {emails.map((email) => {
              const isExpanded = expandedEmail === email.position;
              const isRegenerating = loadingPosition === email.position;
              const edited = hasEdits(email);

              return (
                <div
                  key={email.position}
                  className="bg-white border border-gray-200 rounded-lg overflow-hidden"
                >
                  {/* Card Header */}
                  <button
                    onClick={() =>
                      setExpandedEmail(isExpanded ? null : email.position)
                    }
                    className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`flex items-center justify-center w-10 h-10 rounded-lg font-bold text-sm ${
                          email.isAI
                            ? "bg-purple-50 text-purple-700"
                            : "bg-green-50 text-green-700"
                        }`}
                      >
                        {email.position}
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {email.templateName}
                        </p>
                        <p className="text-xs text-gray-500">
                          Day {email.day} &middot; {email.purpose}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {email.isAI && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 font-medium">
                          AI
                        </span>
                      )}
                      {edited && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 font-medium">
                          Edited
                        </span>
                      )}
                      {email.variationSeed !== undefined && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 font-mono">
                          #{email.variationSeed}
                        </span>
                      )}
                      <svg
                        className={`w-4 h-4 text-gray-400 transition-transform ${
                          isExpanded ? "rotate-180" : ""
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                  </button>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="border-t border-gray-100">
                      {/* Subject + Preview (editable) */}
                      <div className="px-5 py-4 bg-gray-50 space-y-3">
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-medium text-gray-400 uppercase">
                              Subject
                            </span>
                            <button
                              onClick={() =>
                                copyToClipboard(
                                  getSubject(email),
                                  `subject-${email.position}`
                                )
                              }
                              className="text-[10px] text-gray-400 hover:text-green-600"
                            >
                              {copiedField === `subject-${email.position}`
                                ? "Copied!"
                                : "Copy"}
                            </button>
                          </div>
                          {viewMode === "edit" ? (
                            <input
                              type="text"
                              value={getSubject(email)}
                              onChange={(e) =>
                                setEditedSubjects((prev) => ({
                                  ...prev,
                                  [email.position]: e.target.value,
                                }))
                              }
                              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-purple-200 focus:border-purple-400 outline-none"
                            />
                          ) : (
                            <p className="text-sm text-gray-800 font-medium">
                              {getSubject(email)}
                            </p>
                          )}
                        </div>
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-medium text-gray-400 uppercase">
                              Preview Text
                            </span>
                            <button
                              onClick={() =>
                                copyToClipboard(
                                  getPreview(email),
                                  `preview-${email.position}`
                                )
                              }
                              className="text-[10px] text-gray-400 hover:text-green-600"
                            >
                              {copiedField === `preview-${email.position}`
                                ? "Copied!"
                                : "Copy"}
                            </button>
                          </div>
                          {viewMode === "edit" ? (
                            <input
                              type="text"
                              value={getPreview(email)}
                              onChange={(e) =>
                                setEditedPreviews((prev) => ({
                                  ...prev,
                                  [email.position]: e.target.value,
                                }))
                              }
                              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-purple-200 focus:border-purple-400 outline-none"
                            />
                          ) : (
                            <p className="text-sm text-gray-600">
                              {getPreview(email)}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Body Content */}
                      <div className="px-5 py-4">
                        {viewMode === "preview" && (
                          <div className="border border-gray-200 rounded-lg overflow-hidden">
                            <iframe
                              srcDoc={getHtml(email)}
                              title={email.templateName}
                              className="w-full border-0"
                              style={{ height: "500px" }}
                              sandbox="allow-same-origin"
                            />
                          </div>
                        )}

                        {viewMode === "html" && (
                          <div className="relative">
                            <button
                              onClick={() =>
                                copyToClipboard(
                                  getHtml(email),
                                  `html-${email.position}`
                                )
                              }
                              className="absolute top-2 right-2 px-3 py-1 bg-green-600 text-white rounded text-xs font-medium hover:bg-green-700 z-10"
                            >
                              {copiedField === `html-${email.position}`
                                ? "Copied!"
                                : "Copy HTML"}
                            </button>
                            <pre className="bg-gray-900 text-green-400 rounded-lg p-4 text-xs overflow-auto max-h-[500px] leading-relaxed">
                              {getHtml(email)}
                            </pre>
                          </div>
                        )}

                        {viewMode === "text" && (
                          <div className="relative">
                            <button
                              onClick={() =>
                                copyToClipboard(
                                  getPlainText(email),
                                  `text-${email.position}`
                                )
                              }
                              className="absolute top-2 right-2 px-3 py-1 bg-green-600 text-white rounded text-xs font-medium hover:bg-green-700 z-10"
                            >
                              {copiedField === `text-${email.position}`
                                ? "Copied!"
                                : "Copy Text"}
                            </button>
                            <pre className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm text-gray-700 whitespace-pre-wrap max-h-[500px] overflow-auto">
                              {getPlainText(email)}
                            </pre>
                          </div>
                        )}

                        {viewMode === "edit" && (
                          <div className="space-y-4">
                            <div>
                              <div className="flex items-center justify-between mb-1">
                                <label className="text-xs font-medium text-gray-600">
                                  HTML Body
                                </label>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() =>
                                      copyToClipboard(
                                        getHtml(email),
                                        `edithtml-${email.position}`
                                      )
                                    }
                                    className="text-[10px] text-gray-400 hover:text-green-600"
                                  >
                                    {copiedField ===
                                    `edithtml-${email.position}`
                                      ? "Copied!"
                                      : "Copy"}
                                  </button>
                                </div>
                              </div>
                              <textarea
                                value={getHtml(email)}
                                onChange={(e) =>
                                  setEditedHtml((prev) => ({
                                    ...prev,
                                    [email.position]: e.target.value,
                                  }))
                                }
                                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-xs font-mono leading-relaxed focus:ring-2 focus:ring-purple-200 focus:border-purple-400 outline-none"
                                rows={20}
                              />
                            </div>
                            <div>
                              <label className="text-xs font-medium text-gray-600 block mb-1">
                                Plain Text Version
                              </label>
                              <textarea
                                value={getPlainText(email)}
                                onChange={(e) =>
                                  setEditedPlainText((prev) => ({
                                    ...prev,
                                    [email.position]: e.target.value,
                                  }))
                                }
                                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm leading-relaxed focus:ring-2 focus:ring-purple-200 focus:border-purple-400 outline-none"
                                rows={10}
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="px-5 py-3 border-t border-gray-100 flex flex-wrap gap-2">
                        {/* Push to Klaviyo — primary action */}
                        {(() => {
                          const ps = pushStatuses[email.position];
                          const existing = getExistingPush(email.categoryCode, email.position);
                          const isPushing = ps?.state === "pushing";
                          const wasPushed = ps?.state === "pushed" || existing;

                          return (
                            <button
                              onClick={() => handlePushToKlaviyo(email)}
                              disabled={isPushing}
                              className={`px-4 py-1.5 text-xs font-medium rounded transition-colors flex items-center gap-1.5 ${
                                wasPushed
                                  ? "text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100"
                                  : "text-white bg-blue-600 hover:bg-blue-700"
                              } disabled:opacity-50`}
                            >
                              {isPushing ? (
                                <>
                                  <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                  </svg>
                                  Pushing to Klaviyo...
                                </>
                              ) : wasPushed ? (
                                <>
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                  Re-push to Klaviyo
                                </>
                              ) : (
                                <>
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                  </svg>
                                  Push to Klaviyo
                                </>
                              )}
                            </button>
                          );
                        })()}

                        {/* View Setup Instructions */}
                        {(pushStatuses[email.position]?.state === "pushed" ||
                          getExistingPush(email.categoryCode, email.position)) && (
                          <button
                            onClick={() =>
                              setShowInstructions(
                                showInstructions === email.position
                                  ? null
                                  : email.position
                              )
                            }
                            className="px-3 py-1.5 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded hover:bg-amber-100 transition-colors flex items-center gap-1.5"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                            </svg>
                            {showInstructions === email.position ? "Hide" : "Setup"} Instructions
                          </button>
                        )}

                        {/* Regenerate (AI only) */}
                        {useAI && (
                          <button
                            onClick={() => handleRegenerate(email.position)}
                            disabled={isRegenerating}
                            className="px-3 py-1.5 text-xs font-medium text-purple-700 bg-purple-50 border border-purple-200 rounded hover:bg-purple-100 disabled:opacity-50 transition-colors flex items-center gap-1.5"
                          >
                            {isRegenerating ? (
                              <>
                                <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                                Regenerating...
                              </>
                            ) : (
                              <>
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                Regenerate
                              </>
                            )}
                          </button>
                        )}

                        <button
                          onClick={() =>
                            copyToClipboard(getHtml(email), `acthtml-${email.position}`)
                          }
                          className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
                        >
                          {copiedField === `acthtml-${email.position}` ? "Copied!" : "Copy HTML"}
                        </button>
                        <button
                          onClick={() =>
                            copyToClipboard(getSubject(email), `actsubject-${email.position}`)
                          }
                          className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
                        >
                          {copiedField === `actsubject-${email.position}` ? "Copied!" : "Copy Subject"}
                        </button>
                        <button
                          onClick={() => {
                            const blob = new Blob([getHtml(email)], { type: "text/html" });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement("a");
                            a.href = url;
                            a.download = `${email.templateName}.html`;
                            a.click();
                            URL.revokeObjectURL(url);
                          }}
                          className="px-3 py-1.5 text-xs font-medium text-white bg-green-600 rounded hover:bg-green-700 transition-colors"
                        >
                          Download HTML
                        </button>

                        {/* Reset edits */}
                        {edited && (
                          <button
                            onClick={() => {
                              setEditedSubjects((prev) => {
                                const next = { ...prev };
                                delete next[email.position];
                                return next;
                              });
                              setEditedPreviews((prev) => {
                                const next = { ...prev };
                                delete next[email.position];
                                return next;
                              });
                              setEditedHtml((prev) => {
                                const next = { ...prev };
                                delete next[email.position];
                                return next;
                              });
                              setEditedPlainText((prev) => {
                                const next = { ...prev };
                                delete next[email.position];
                                return next;
                              });
                            }}
                            className="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 rounded hover:bg-red-100 transition-colors"
                          >
                            Reset Edits
                          </button>
                        )}
                      </div>

                      {/* Push error */}
                      {pushStatuses[email.position]?.state === "error" && (
                        <div className="px-5 py-3 border-t border-red-100 bg-red-50">
                          <p className="text-xs text-red-700 font-medium">
                            Push failed: {pushStatuses[email.position]?.error}
                          </p>
                          <p className="text-[10px] text-red-500 mt-1">
                            Make sure KLAVIYO_PRIVATE_API_KEY is set in your Vercel environment variables.
                          </p>
                        </div>
                      )}

                      {/* Post-Push Instructions Panel */}
                      {showInstructions === email.position && (
                        <div className="px-5 py-4 border-t border-blue-100 bg-gradient-to-b from-blue-50 to-white">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center">
                              <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                              </svg>
                            </div>
                            <h4 className="text-sm font-bold text-gray-900">
                              Klaviyo Setup Instructions
                            </h4>
                          </div>

                          {/* Klaviyo Template Link */}
                          {(() => {
                            const ps = pushStatuses[email.position];
                            const existing = getExistingPush(email.categoryCode, email.position);
                            const editUrl = ps?.editUrl || existing?.editUrl;
                            const templateId = ps?.klaviyoTemplateId || existing?.klaviyoTemplateId;

                            return editUrl ? (
                              <a
                                href={editUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-4 py-2 mb-4 bg-white border border-blue-200 rounded-lg text-sm text-blue-700 font-medium hover:bg-blue-50 transition-colors"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                                Open Template in Klaviyo ({templateId})
                              </a>
                            ) : null;
                          })()}

                          <ol className="space-y-3 text-sm text-gray-700">
                            <li className="flex gap-3">
                              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center">1</span>
                              <div>
                                <p className="font-medium">Open the template in Klaviyo</p>
                                <p className="text-xs text-gray-500 mt-0.5">Click the link above to review and make any final edits in the Klaviyo editor.</p>
                              </div>
                            </li>
                            <li className="flex gap-3">
                              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center">2</span>
                              <div>
                                <p className="font-medium">Add template to the {flowDef?.name || "flow"}</p>
                                <p className="text-xs text-gray-500 mt-0.5">
                                  Go to <strong>Flows → {flowDef?.name}</strong> → find the{" "}
                                  <strong>{email.position} (Day {email.day})</strong> email action → click &ldquo;Edit Content&rdquo; →
                                  select &ldquo;Saved Templates&rdquo; → choose <strong>{email.templateName}</strong>.
                                </p>
                              </div>
                            </li>
                            <li className="flex gap-3">
                              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center">3</span>
                              <div>
                                <p className="font-medium">Set the subject line &amp; preview text</p>
                                <p className="text-xs text-gray-500 mt-0.5">
                                  Subject: <code className="bg-gray-100 px-1.5 py-0.5 rounded text-[11px]">{getSubject(email)}</code>
                                </p>
                                <p className="text-xs text-gray-500 mt-0.5">
                                  Preview: <code className="bg-gray-100 px-1.5 py-0.5 rounded text-[11px]">{getPreview(email)}</code>
                                </p>
                              </div>
                            </li>
                            <li className="flex gap-3">
                              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center">4</span>
                              <div>
                                <p className="font-medium">Configure flow settings</p>
                                <p className="text-xs text-gray-500 mt-0.5">
                                  Set the time delay to <strong>Day {email.day}</strong> from flow entry.
                                  Enable Smart Sending. Set the &ldquo;From&rdquo; name and email address.
                                </p>
                              </div>
                            </li>
                            <li className="flex gap-3">
                              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center">5</span>
                              <div>
                                <p className="font-medium">Set the email action to Live</p>
                                <p className="text-xs text-gray-500 mt-0.5">
                                  Change the email status from &ldquo;Draft&rdquo; to &ldquo;Live&rdquo; in the flow builder.
                                  Once live, come back here and click &ldquo;Mark as Live&rdquo; below.
                                </p>
                              </div>
                            </li>
                          </ol>

                          {/* Mark as Live button */}
                          {(() => {
                            const existing = getExistingPush(email.categoryCode, email.position);
                            const isLive = existing?.status === "live";
                            return (
                              <div className="mt-4 pt-4 border-t border-blue-100 flex items-center gap-3">
                                <button
                                  onClick={() => handleMarkAsLive(email)}
                                  disabled={isLive}
                                  className={`px-5 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 ${
                                    isLive
                                      ? "bg-green-100 text-green-700 cursor-default"
                                      : "bg-green-600 text-white hover:bg-green-700"
                                  }`}
                                >
                                  {isLive ? (
                                    <>
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                      </svg>
                                      Live — Marked as Done
                                    </>
                                  ) : (
                                    <>
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                      </svg>
                                      Mark as Live
                                    </>
                                  )}
                                </button>
                                {isLive && existing?.markedLiveAt && (
                                  <p className="text-[10px] text-gray-400">
                                    Marked live {new Date(existing.markedLiveAt).toLocaleString()}
                                  </p>
                                )}
                              </div>
                            );
                          })()}
                        </div>
                      )}

                      {/* Generation metadata */}
                      {email.isAI && email.generatedAt && (
                        <div className="px-5 py-2 border-t border-gray-100 bg-gray-50">
                          <p className="text-[10px] text-gray-400">
                            Generated{" "}
                            {new Date(email.generatedAt).toLocaleString()} &middot;
                            Seed #{email.variationSeed} &middot; Tone: {tone}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Empty State */}
      {emails.length === 0 && !loading && (
        <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
          <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h3 className="text-sm font-semibold text-gray-900 mb-1">
            Generate Email Content
          </h3>
          <p className="text-xs text-gray-500 max-w-md mx-auto mb-4">
            Select a flow type{flowDef?.requiresCategory ? ", category," : ""} and email position, then
            generate AI-powered email content. Each generation creates unique content
            you can edit and customize. Generated emails are auto-saved.
          </p>

          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3 max-w-2xl mx-auto text-left">
            <div className="bg-purple-50 rounded-lg p-3">
              <p className="text-xs font-semibold text-purple-700">
                AI Content
              </p>
              <p className="text-[10px] text-purple-500">
                Claude-powered generation
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs font-semibold text-gray-700">
                10 Flow Types
              </p>
              <p className="text-[10px] text-gray-500">
                Nurture, cart, winback...
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs font-semibold text-gray-700">
                Auto-Saved
              </p>
              <p className="text-[10px] text-gray-500">
                Persists across refreshes
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs font-semibold text-gray-700">
                Push to Klaviyo
              </p>
              <p className="text-[10px] text-gray-500">
                One-click template push
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
