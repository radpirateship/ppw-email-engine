"use client";

import { useState, useEffect, useCallback } from "react";

interface ExistingCategory {
  code: string;
  name: string;
  hasQuiz: boolean;
}

interface PatchItem {
  file: string;
  description: string;
  snippet: string;
  insertAfter?: string;
}

interface PropagationResult {
  success: boolean;
  categoryCode: string;
  patches: PatchItem[];
  summary: string;
}

const FONT_MONO = "font-mono text-xs";

export default function PropagatePage() {
  // Form state
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [tagSlug, setTagSlug] = useState("");
  const [keyProducts, setKeyProducts] = useState("");
  const [articleCount, setArticleCount] = useState(10);
  const [hasQuiz, setHasQuiz] = useState(true);
  const [pillarContent, setPillarContent] = useState("");
  const [contentAreas, setContentAreas] = useState(["", "", "", "", ""]);
  const [classifierKeywords, setClassifierKeywords] = useState("");
  const [crossSellCodes, setCrossSellCodes] = useState<string[]>([]);
  const [goalBoosts, setGoalBoosts] = useState<string[]>([]);
  const [entryCriteria, setEntryCriteria] = useState("");

  // System state
  const [existing, setExisting] = useState<ExistingCategory[]>([]);
  const [availableGoals, setAvailableGoals] = useState<string[]>([]);
  const [result, setResult] = useState<PropagationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  // Load metadata
  useEffect(() => {
    fetch("/api/propagate-category")
      .then((r) => r.json())
      .then((data) => {
        setExisting(data.existingCategories || []);
        setAvailableGoals(data.availableGoals || []);
      })
      .catch(() => {});
  }, []);

  // Auto-generate tagSlug from name
  useEffect(() => {
    if (name && !tagSlug) {
      setTagSlug(name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+$/, ""));
    }
  }, [name, tagSlug]);

  // Auto-generate pillar content from name
  useEffect(() => {
    if (name && !pillarContent) {
      setPillarContent(`Ultimate Guide to ${name}`);
    }
  }, [name, pillarContent]);

  const updateContentArea = useCallback(
    (idx: number, val: string) => {
      setContentAreas((prev) => {
        const next = [...prev];
        next[idx] = val;
        return next;
      });
    },
    []
  );

  const toggleCrossSell = (c: string) => {
    setCrossSellCodes((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]
    );
  };

  const toggleGoal = (g: string) => {
    setGoalBoosts((prev) =>
      prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]
    );
  };

  async function handlePropagate() {
    setError("");
    setResult(null);
    setLoading(true);
    try {
      const body = {
        code: code.toUpperCase(),
        name,
        tagSlug: tagSlug || name.toLowerCase().replace(/\s+/g, "-"),
        keyProducts: keyProducts
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        articleCount,
        hasQuiz,
        pillarContent: pillarContent || `Ultimate Guide to ${name}`,
        contentAreas: contentAreas.filter(Boolean),
        classifierKeywords: classifierKeywords
          .split(",")
          .map((s) => s.trim().toLowerCase())
          .filter(Boolean),
        crossSellCategories: crossSellCodes,
        goalBoosts,
        entryCriteria: entryCriteria || `Interest in ${name.toLowerCase()}`,
      };

      const res = await fetch("/api/propagate-category", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Propagation failed");
        return;
      }
      setResult(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Request failed");
    } finally {
      setLoading(false);
    }
  }

  function copySnippet(idx: number, text: string) {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  }

  function copyAll() {
    if (!result) return;
    const full = result.patches
      .map(
        (p, i) =>
          `// === ${i + 1}. ${p.file} ===\n// ${p.description}\n${p.insertAfter ? `// Insert after: "${p.insertAfter}"\n` : ""}${p.snippet}`
      )
      .join("\n\n");
    navigator.clipboard.writeText(full);
  }

  // Validation
  const isValid =
    code.length === 3 &&
    name.length > 0 &&
    contentAreas.filter(Boolean).length >= 3 &&
    classifierKeywords.split(",").filter((s) => s.trim()).length >= 5;

  return (
    <div className="px-8 py-8 max-w-5xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Category Propagator
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Add a new product collection and propagate it across all framework
          files — categories, flows, lists, segments, templates, and more.
        </p>
      </div>

      {/* Existing categories */}
      <div className="mb-6 bg-gray-50 rounded-lg p-4">
        <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">
          Current Categories ({existing.length})
        </h3>
        <div className="flex flex-wrap gap-2">
          {existing.map((c) => (
            <span
              key={c.code}
              className={`text-xs px-2 py-1 rounded-full ${
                c.hasQuiz
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-200 text-gray-600"
              }`}
            >
              <span className="font-mono font-bold">{c.code}</span> {c.name}
              {c.hasQuiz && " ✓"}
            </span>
          ))}
        </div>
      </div>

      {!result ? (
        <div className="space-y-6">
          {/* Row 1: Code + Name + Slug */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Category Code *
              </label>
              <input
                type="text"
                maxLength={3}
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="SQR"
                className="w-full px-3 py-2 border rounded-lg text-sm font-mono uppercase"
              />
              <p className="text-[10px] text-gray-400 mt-1">
                3 uppercase letters
              </p>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Category Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Squat Racks"
                className="w-full px-3 py-2 border rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Shopify Tag Slug
              </label>
              <input
                type="text"
                value={tagSlug}
                onChange={(e) => setTagSlug(e.target.value)}
                placeholder="squat-racks"
                className="w-full px-3 py-2 border rounded-lg text-sm font-mono"
              />
            </div>
          </div>

          {/* Key Products + Article Count + Quiz */}
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Key Products (comma-separated) *
              </label>
              <input
                type="text"
                value={keyProducts}
                onChange={(e) => setKeyProducts(e.target.value)}
                placeholder="Power Racks, Squat Stands, Half Racks, Smith Machines"
                className="w-full px-3 py-2 border rounded-lg text-sm"
              />
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Articles
                </label>
                <input
                  type="number"
                  value={articleCount}
                  onChange={(e) => setArticleCount(Number(e.target.value))}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>
              <div className="flex items-end pb-2">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={hasQuiz}
                    onChange={(e) => setHasQuiz(e.target.checked)}
                    className="w-4 h-4 text-green-600 rounded"
                  />
                  Has Quiz
                </label>
              </div>
            </div>
          </div>

          {/* Pillar Content */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Pillar Content Title
            </label>
            <input
              type="text"
              value={pillarContent}
              onChange={(e) => setPillarContent(e.target.value)}
              placeholder="Ultimate Guide to Squat Racks"
              className="w-full px-3 py-2 border rounded-lg text-sm"
            />
          </div>

          {/* Content Areas */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">
              Content Areas (at least 3) *
            </label>
            <div className="space-y-2">
              {["Health & Benefits", "Comparisons & Types", "Buyer's Guides & Reviews", "Brands & Products", "Setup & Maintenance"].map(
                (hint, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <span className="text-[10px] text-gray-400 w-32 flex-shrink-0">
                      {hint}
                    </span>
                    <input
                      type="text"
                      value={contentAreas[idx]}
                      onChange={(e) => updateContentArea(idx, e.target.value)}
                      placeholder={`e.g., Strength training, home gym setup, rack comparisons...`}
                      className="flex-1 px-3 py-1.5 border rounded-lg text-sm"
                    />
                  </div>
                )
              )}
            </div>
          </div>

          {/* Classifier Keywords */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Classifier Keywords (comma-separated, 5+ required) *
            </label>
            <textarea
              value={classifierKeywords}
              onChange={(e) => setClassifierKeywords(e.target.value)}
              placeholder="squat rack, power rack, squat stand, half rack, smith machine, barbell rack, cage, j-hooks, safety bars, pull-up bar"
              rows={2}
              className="w-full px-3 py-2 border rounded-lg text-sm"
            />
            <p className="text-[10px] text-gray-400 mt-1">
              {classifierKeywords.split(",").filter((s) => s.trim()).length}{" "}
              keywords entered
            </p>
          </div>

          {/* Cross-sell Categories */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">
              Cross-Sell Categories (select 2-4 related)
            </label>
            <div className="flex flex-wrap gap-2">
              {existing.map((c) => (
                <button
                  key={c.code}
                  onClick={() => toggleCrossSell(c.code)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                    crossSellCodes.includes(c.code)
                      ? "bg-green-100 border-green-400 text-green-700"
                      : "bg-white border-gray-300 text-gray-600 hover:border-gray-400"
                  }`}
                >
                  {c.code} {c.name}
                </button>
              ))}
            </div>
          </div>

          {/* Goal Boosts */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">
              Wellness Goal Mapping
            </label>
            <div className="flex flex-wrap gap-2">
              {availableGoals.map((g) => (
                <button
                  key={g}
                  onClick={() => toggleGoal(g)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-colors capitalize ${
                    goalBoosts.includes(g)
                      ? "bg-blue-100 border-blue-400 text-blue-700"
                      : "bg-white border-gray-300 text-gray-600 hover:border-gray-400"
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          {/* Entry Criteria */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              List Entry Criteria
            </label>
            <input
              type="text"
              value={entryCriteria}
              onChange={(e) => setEntryCriteria(e.target.value)}
              placeholder="Interest in squat racks and power racks"
              className="w-full px-3 py-2 border rounded-lg text-sm"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Submit */}
          <div className="flex items-center gap-4">
            <button
              onClick={handlePropagate}
              disabled={!isValid || loading}
              className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                isValid && !loading
                  ? "bg-green-600 text-white hover:bg-green-700"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              {loading ? "Generating..." : "Propagate Category"}
            </button>
            {!isValid && (
              <p className="text-xs text-gray-400">
                Fill in all required fields (code, name, 3+ content areas, 5+
                keywords)
              </p>
            )}
          </div>

          {/* What will be created */}
          {code && name && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-xs font-semibold text-blue-700 uppercase mb-2">
                Preview — What will be generated
              </h3>
              <ul className="text-xs text-blue-600 space-y-1">
                <li>
                  ✓ Category: <code className={FONT_MONO}>{code.toUpperCase()}</code> — {name}
                </li>
                <li>✓ List: L-{code.toUpperCase()}-Subscribers</li>
                <li>
                  ✓ Segment: S-INT-{name.replace(/\s+/g, "")}
                </li>
                {hasQuiz && (
                  <>
                    <li>
                      ✓ Flow: F-{code.toUpperCase()}-Welcome-Quiz (11 emails)
                    </li>
                    <li>
                      ✓ Quiz List: L-{code.toUpperCase()}-Quiz-Leads
                    </li>
                    <li>
                      ✓ Templates: T-{code.toUpperCase()}-Nurture-E1 through E11
                    </li>
                  </>
                )}
                <li>✓ Content classifier keywords</li>
                <li>✓ Cross-sell and goal mappings</li>
              </ul>
            </div>
          )}
        </div>
      ) : (
        /* Results */
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-300 rounded-lg p-4">
            <h3 className="text-sm font-bold text-green-800 mb-2">
              ✓ Category {result.categoryCode} Propagated Successfully
            </h3>
            <pre className="text-xs text-green-700 whitespace-pre-wrap">
              {result.summary}
            </pre>
          </div>

          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-900">
              Code Patches ({result.patches.length} files)
            </h3>
            <div className="flex gap-2">
              <button
                onClick={copyAll}
                className="text-xs px-3 py-1.5 bg-gray-800 text-white rounded-lg hover:bg-gray-900"
              >
                Copy All Patches
              </button>
              <button
                onClick={() => setResult(null)}
                className="text-xs px-3 py-1.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                ← Back to Form
              </button>
            </div>
          </div>

          {result.patches.map((patch, idx) => (
            <div
              key={idx}
              className="bg-white border border-gray-200 rounded-lg overflow-hidden"
            >
              <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b">
                <div>
                  <span className="text-xs font-mono text-gray-500">
                    {patch.file}
                  </span>
                  <span className="text-xs text-gray-400 ml-3">
                    {patch.description}
                  </span>
                </div>
                <button
                  onClick={() => copySnippet(idx, patch.snippet)}
                  className="text-xs px-2 py-1 bg-white border rounded hover:bg-gray-50"
                >
                  {copiedIdx === idx ? "✓ Copied" : "Copy"}
                </button>
              </div>
              {patch.insertAfter && (
                <div className="px-4 py-1 bg-yellow-50 text-[10px] text-yellow-700 border-b">
                  Insert after comment: <code>{patch.insertAfter}</code>
                </div>
              )}
              <pre className="px-4 py-3 text-xs text-gray-800 overflow-x-auto bg-gray-900 text-green-400">
                {patch.snippet}
              </pre>
            </div>
          ))}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-xs font-semibold text-blue-700 uppercase mb-2">
              Next Steps
            </h3>
            <ol className="text-xs text-blue-600 space-y-1 list-decimal list-inside">
              <li>Copy the patches above into the corresponding framework files</li>
              <li>Add insertion-point comments to framework files (one-time setup)</li>
              <li>Run the Copy Generator to create email templates for the new category</li>
              {hasQuiz && <li>Build the quiz on your site and connect it to Klaviyo</li>}
              <li>Set up the Klaviyo flow, list, and segment to match</li>
              <li>Deploy and verify everything in the Delta Dashboard</li>
            </ol>
          </div>
        </div>
      )}
    </div>
  );
}
