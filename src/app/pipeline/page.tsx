"use client";

import { useState, useCallback } from "react";
import {
  classifyContent,
  classifyBatch,
  mapContentToPositions,
  getCategoryLabel,
  type ContentInput,
  type ClassifiedContent,
  type PositionMapping,
} from "@/framework/classifier";
import { CATEGORIES, CATEGORY_CODES } from "@/framework/categories";

// ---------------------------------------------------------------------------
// Content type badge colours
// ---------------------------------------------------------------------------
const TYPE_COLOURS: Record<string, string> = {
  benefit: "bg-blue-100 text-blue-700",
  comparison: "bg-purple-100 text-purple-700",
  "buyers-guide": "bg-amber-100 text-amber-700",
  "brand-spotlight": "bg-pink-100 text-pink-700",
  installation: "bg-orange-100 text-orange-700",
  "social-proof": "bg-emerald-100 text-emerald-700",
  science: "bg-indigo-100 text-indigo-700",
  "how-to": "bg-cyan-100 text-cyan-700",
  "pillar-content": "bg-red-100 text-red-700",
  "product-review": "bg-rose-100 text-rose-700",
};

function TypeBadge({ type }: { type: string }) {
  return (
    <span
      className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full ${
        TYPE_COLOURS[type] ?? "bg-gray-100 text-gray-600"
      }`}
    >
      {type}
    </span>
  );
}

function ConfidenceBar({ value }: { value: number }) {
  const pct = Math.round(value * 100);
  const colour =
    pct >= 75 ? "bg-green-500" : pct >= 40 ? "bg-yellow-500" : "bg-red-400";
  return (
    <div className="flex items-center gap-2">
      <div className="w-20 h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${colour}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-[10px] text-gray-400">{pct}%</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main page component
// ---------------------------------------------------------------------------
export default function PipelinePage() {
  // Input state
  const [inputMode, setInputMode] = useState<"single" | "batch">("single");
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [summary, setSummary] = useState("");
  const [batchText, setBatchText] = useState("");

  // Results state
  const [results, setResults] = useState<ClassifiedContent[]>([]);
  const [positionMap, setPositionMap] = useState<PositionMapping[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");

  // Classify single article
  const handleClassifySingle = useCallback(() => {
    if (!title.trim()) return;
    const input: ContentInput = {
      title: title.trim(),
      url: url.trim() || undefined,
      summary: summary.trim() || undefined,
    };
    const classified = classifyContent(input);
    setResults((prev) => [...prev, classified]);
    // Remap positions
    const allResults = [...results, classified];
    setPositionMap(
      mapContentToPositions(allResults, categoryFilter === "ALL" ? undefined : categoryFilter)
    );
    // Clear input
    setTitle("");
    setUrl("");
    setSummary("");
  }, [title, url, summary, results, categoryFilter]);

  // Classify batch (one title per line)
  const handleClassifyBatch = useCallback(() => {
    if (!batchText.trim()) return;
    const lines = batchText
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    const inputs: ContentInput[] = lines.map((line) => {
      // Try to detect URL at end of line
      const parts = line.split(/\s+/);
      const last = parts[parts.length - 1];
      if (last.startsWith("http://") || last.startsWith("https://")) {
        return { title: parts.slice(0, -1).join(" "), url: last };
      }
      return { title: line };
    });
    const classified = classifyBatch(inputs);
    const allResults = [...results, ...classified];
    setResults(allResults);
    setPositionMap(
      mapContentToPositions(allResults, categoryFilter === "ALL" ? undefined : categoryFilter)
    );
    setBatchText("");
  }, [batchText, results, categoryFilter]);

  // Category filter change
  const handleFilterChange = useCallback(
    (code: string) => {
      setCategoryFilter(code);
      setPositionMap(
        mapContentToPositions(results, code === "ALL" ? undefined : code)
      );
    },
    [results]
  );

  // Clear all results
  const handleClear = () => {
    setResults([]);
    setPositionMap([]);
  };

  // Remove a single result
  const handleRemove = (index: number) => {
    const updated = results.filter((_, i) => i !== index);
    setResults(updated);
    setPositionMap(
      mapContentToPositions(updated, categoryFilter === "ALL" ? undefined : categoryFilter)
    );
  };

  // Stats
  const filledPositions = positionMap.filter((p) => p.isFilled).length;
  const totalPositions = positionMap.length;
  const uniqueCategories = Array.from(new Set(results.flatMap((r) => r.categories)));

  return (
    <div className="px-8 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
          Content-to-Email Pipeline
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Feed in articles and the engine auto-classifies each piece then maps
          it to the correct position in the 45-day nurture flow.
        </p>
      </div>

      {/* Input Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-5 mb-6">
        {/* Mode Toggle */}
        <div className="flex items-center gap-2 mb-4">
          <button
            onClick={() => setInputMode("single")}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              inputMode === "single"
                ? "bg-green-100 text-green-700"
                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
            }`}
          >
            Single Article
          </button>
          <button
            onClick={() => setInputMode("batch")}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              inputMode === "batch"
                ? "bg-green-100 text-green-700"
                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
            }`}
          >
            Batch Import
          </button>
        </div>

        {inputMode === "single" ? (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Article Title <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Infrared vs Traditional Sauna: Which Is Better for Recovery?"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-400"
                onKeyDown={(e) => e.key === "Enter" && handleClassifySingle()}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  URL <span className="text-gray-400">(optional)</span>
                </label>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://peakprimalwellness.com/..."
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-400"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Summary <span className="text-gray-400">(optional)</span>
                </label>
                <input
                  type="text"
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="Brief description of the article content"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-400"
                />
              </div>
            </div>
            <button
              onClick={handleClassifySingle}
              disabled={!title.trim()}
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Classify &amp; Map
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Paste article titles (one per line, optionally ending with a URL)
              </label>
              <textarea
                value={batchText}
                onChange={(e) => setBatchText(e.target.value)}
                rows={6}
                placeholder={`Infrared vs Traditional Sauna: Which Is Better? https://ppw.com/infrared-vs-traditional
5 Health Benefits of Cold Plunges
Best Red Light Therapy Panels 2025
How to Install a Barrel Sauna in Your Backyard`}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-400 font-mono"
              />
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleClassifyBatch}
                disabled={!batchText.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Classify All ({batchText.split("\n").filter((l) => l.trim()).length} articles)
              </button>
              <span className="text-xs text-gray-400">
                Each line becomes a separate article entry
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      {results.length > 0 && (
        <>
          {/* Stats Bar */}
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-6 text-xs text-gray-500">
              <span>
                <strong className="text-gray-900">{results.length}</strong>{" "}
                articles classified
              </span>
              <span>
                <strong className="text-gray-900">{uniqueCategories.length}</strong>{" "}
                categories detected
              </span>
              <span>
                <strong className="text-green-700">{filledPositions}</strong>
                <span className="text-gray-400">/{totalPositions}</span>{" "}
                positions filled
              </span>
            </div>
            <div className="ml-auto flex items-center gap-2">
              {/* Category Filter */}
              <select
                value={categoryFilter}
                onChange={(e) => handleFilterChange(e.target.value)}
                className="text-xs border border-gray-200 rounded-md px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-green-200"
              >
                <option value="ALL">All Categories</option>
                {CATEGORY_CODES.map((code) => (
                  <option key={code} value={code}>
                    {code} — {CATEGORIES[code].name}
                  </option>
                ))}
              </select>
              <button
                onClick={handleClear}
                className="text-xs text-red-500 hover:text-red-700 px-2 py-1.5"
              >
                Clear All
              </button>
            </div>
          </div>

          {/* Two-column layout: classified articles + position map */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Classified Articles */}
            <div>
              <h2 className="text-sm font-semibold text-gray-900 mb-3">
                Classified Articles
              </h2>
              <div className="space-y-2">
                {results.map((r, i) => (
                  <div
                    key={i}
                    className="bg-white border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="text-sm font-medium text-gray-900 leading-snug">
                        {r.input.title}
                      </h3>
                      <button
                        onClick={() => handleRemove(i)}
                        className="text-gray-300 hover:text-red-400 shrink-0"
                        title="Remove"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <TypeBadge type={r.contentType} />
                      {r.categories.map((c) => (
                        <span
                          key={c}
                          className="text-[10px] font-mono px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded"
                        >
                          {c}
                        </span>
                      ))}
                      <ConfidenceBar value={r.confidence} />
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {r.positions.map((p) => (
                        <span
                          key={p.position}
                          className="text-[10px] font-medium px-2 py-0.5 bg-green-50 text-green-700 rounded-full"
                        >
                          {p.position} · Day {p.day}
                        </span>
                      ))}
                    </div>

                    {r.input.url && (
                      <p className="text-[10px] text-gray-400 mt-2 truncate">
                        {r.input.url}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Position Map (45-day timeline) */}
            <div>
              <h2 className="text-sm font-semibold text-gray-900 mb-3">
                45-Day Nurture Flow Map
                {categoryFilter !== "ALL" && (
                  <span className="ml-2 text-xs font-normal text-gray-400">
                    ({getCategoryLabel(categoryFilter)})
                  </span>
                )}
              </h2>
              <div className="space-y-1.5">
                {positionMap.map((pos) => (
                  <div
                    key={pos.position}
                    className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
                      pos.isFilled
                        ? "bg-green-50 border-green-200"
                        : "bg-gray-50 border-gray-200"
                    }`}
                  >
                    {/* Position label */}
                    <div className="shrink-0 text-center w-12">
                      <div
                        className={`text-sm font-bold ${
                          pos.isFilled ? "text-green-700" : "text-gray-400"
                        }`}
                      >
                        {pos.position}
                      </div>
                      <div className="text-[10px] text-gray-400">
                        Day {pos.day}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-600 mb-1">
                        {pos.purpose}
                      </p>
                      {pos.isFilled ? (
                        <div className="space-y-1">
                          {pos.assignedContent.map((c, j) => (
                            <div
                              key={j}
                              className="text-xs text-green-800 bg-green-100 px-2 py-1 rounded truncate"
                            >
                              {c.input.title}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-[10px] text-gray-400 italic">
                          No content assigned yet
                        </span>
                      )}
                    </div>

                    {/* Status indicator */}
                    <div className="shrink-0">
                      {pos.isFilled ? (
                        <svg
                          className="w-5 h-5 text-green-500"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                      ) : (
                        <svg
                          className="w-5 h-5 text-gray-300"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <circle cx="12" cy="12" r="10" strokeWidth={1.5} />
                        </svg>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Empty state */}
      {results.length === 0 && (
        <div className="text-center py-16">
          <svg
            className="w-12 h-12 text-gray-300 mx-auto mb-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
            />
          </svg>
          <p className="text-sm text-gray-400">
            Add articles above to classify and map them to the nurture flow
          </p>
          <p className="text-xs text-gray-300 mt-1">
            Try pasting a few article titles to see the auto-classification in action
          </p>
        </div>
      )}

      {/* Footer */}
      <div className="mt-12 pt-4 border-t border-gray-200 text-center text-xs text-gray-400">
        PPW Email Engine v0.4.0 &middot; Phase 5: Content-to-Email Pipeline
      </div>
    </div>
  );
}
