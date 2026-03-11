"use client";

import { useState } from "react";
import {
  CATEGORIES,
  CATEGORY_CODES,
} from "@/framework/categories";
import {
  NURTURE_EMAIL_POSITIONS,
} from "@/framework/content-map";

interface GeneratedTemplate {
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

export default function CopyGeneratorPage() {
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedPosition, setSelectedPosition] = useState("ALL");
  const [templates, setTemplates] = useState<GeneratedTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [expandedTemplate, setExpandedTemplate] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"preview" | "html" | "text">("preview");

  const handleGenerate = async () => {
    if (!selectedCategory) {
      setError("Please select a category.");
      return;
    }
    setError("");
    setLoading(true);
    setTemplates([]);

    try {
      const params = new URLSearchParams({
        category: selectedCategory,
      });
      if (selectedPosition !== "ALL") {
        params.set("position", selectedPosition);
      }

      const res = await fetch(`/api/copy-generator?${params.toString()}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Generation failed.");
        return;
      }

      setTemplates(data.templates);
      if (data.templates.length === 1) {
        setExpandedTemplate(data.templates[0].position);
      }
    } catch {
      setError("Failed to generate templates. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).catch(() => {
      // Fallback: select text
    });
  };

  return (
    <div className="px-8 py-8 max-w-5xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
          Email Copy Generator
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Generate Klaviyo-ready email copy for each position in the 45-day nurture flow.
        </p>
      </div>

      {/* Controls */}
      <div className="bg-white border border-gray-200 rounded-lg p-5 mb-6">
        <div className="flex flex-wrap items-end gap-4">
          {/* Category Selector */}
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
              {CATEGORY_CODES.map((code) => {
                const cat = CATEGORIES[code];
                return (
                  <option key={code} value={code}>
                    {code} — {cat.name}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Position Selector */}
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-medium text-gray-600 mb-1.5">
              Email Position
            </label>
            <select
              value={selectedPosition}
              onChange={(e) => setSelectedPosition(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-green-200 focus:border-green-400 outline-none"
            >
              <option value="ALL">All Positions (E1–E11)</option>
              {NURTURE_EMAIL_POSITIONS.map((pos) => (
                <option key={pos.position} value={pos.position}>
                  {pos.position} — Day {pos.day}: {pos.purpose}
                </option>
              ))}
            </select>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={loading || !selectedCategory}
            className="px-6 py-2.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Generating...
              </span>
            ) : (
              "Generate Email Copy"
            )}
          </button>
        </div>

        {error && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {error}
          </div>
        )}
      </div>

      {/* Results */}
      {templates.length > 0 && (
        <>
          {/* Stats Bar */}
          <div className="flex gap-4 mb-4">
            <div className="bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-center flex-1">
              <p className="text-lg font-bold text-green-700">{templates.length}</p>
              <p className="text-[10px] text-gray-400">Templates</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-center flex-1">
              <p className="text-lg font-bold text-green-700">{templates[0]?.categoryCode}</p>
              <p className="text-[10px] text-gray-400">Category</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-center flex-1">
              <p className="text-lg font-bold text-green-700">
                {templates.reduce((acc, t) => acc + t.variables.length, 0)}
              </p>
              <p className="text-[10px] text-gray-400">Dynamic Tags</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-center flex-1">
              <p className="text-lg font-bold text-green-700">
                {templates.reduce((acc, t) => acc + t.conditionals.length, 0)}
              </p>
              <p className="text-[10px] text-gray-400">Conditional Blocks</p>
            </div>
          </div>

          {/* View Mode Toggle */}
          <div className="flex gap-1 mb-4 bg-white border border-gray-200 rounded-lg p-1 w-fit">
            {(["preview", "html", "text"] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  viewMode === mode
                    ? "bg-green-100 text-green-700"
                    : "text-gray-500 hover:bg-gray-50"
                }`}
              >
                {mode === "preview" ? "Preview" : mode === "html" ? "HTML" : "Plain Text"}
              </button>
            ))}
          </div>

          {/* Template Cards */}
          <div className="space-y-3">
            {templates.map((template) => {
              const isExpanded = expandedTemplate === template.position;

              return (
                <div
                  key={template.position}
                  className="bg-white border border-gray-200 rounded-lg overflow-hidden"
                >
                  {/* Card Header */}
                  <button
                    onClick={() =>
                      setExpandedTemplate(isExpanded ? null : template.position)
                    }
                    className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex items-center justify-center w-10 h-10 rounded-lg bg-green-50 text-green-700 font-bold text-sm">
                        {template.position}
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {template.templateName}
                        </p>
                        <p className="text-xs text-gray-500">
                          Day {template.day} &middot; {template.purpose}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">
                        {template.variables.length} tags
                      </span>
                      {template.conditionals.length > 0 && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 font-medium">
                          {template.conditionals.length} conditional
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
                      {/* Subject + Preview */}
                      <div className="px-5 py-4 bg-gray-50 space-y-2">
                        <div>
                          <span className="text-[10px] font-medium text-gray-400 uppercase">Subject</span>
                          <p className="text-sm text-gray-800 font-medium">{template.subject}</p>
                        </div>
                        <div>
                          <span className="text-[10px] font-medium text-gray-400 uppercase">Preview Text</span>
                          <p className="text-sm text-gray-600">{template.previewText}</p>
                        </div>
                      </div>

                      {/* Body Content */}
                      <div className="px-5 py-4">
                        {viewMode === "preview" && (
                          <div className="border border-gray-200 rounded-lg overflow-hidden">
                            <iframe
                              srcDoc={template.htmlBody}
                              title={template.templateName}
                              className="w-full border-0"
                              style={{ height: "500px" }}
                              sandbox="allow-same-origin"
                            />
                          </div>
                        )}

                        {viewMode === "html" && (
                          <div className="relative">
                            <button
                              onClick={() => copyToClipboard(template.htmlBody)}
                              className="absolute top-2 right-2 px-3 py-1 bg-green-600 text-white rounded text-xs font-medium hover:bg-green-700"
                            >
                              Copy HTML
                            </button>
                            <pre className="bg-gray-900 text-green-400 rounded-lg p-4 text-xs overflow-auto max-h-[500px] leading-relaxed">
                              {template.htmlBody}
                            </pre>
                          </div>
                        )}

                        {viewMode === "text" && (
                          <div className="relative">
                            <button
                              onClick={() => copyToClipboard(template.plainText)}
                              className="absolute top-2 right-2 px-3 py-1 bg-green-600 text-white rounded text-xs font-medium hover:bg-green-700"
                            >
                              Copy Text
                            </button>
                            <pre className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm text-gray-700 whitespace-pre-wrap">
                              {template.plainText}
                            </pre>
                          </div>
                        )}
                      </div>

                      {/* Variables & Conditionals */}
                      <div className="px-5 py-4 border-t border-gray-100 bg-gray-50">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Klaviyo Variables */}
                          <div>
                            <h4 className="text-xs font-semibold text-gray-700 mb-2">
                              Klaviyo Variables ({template.variables.length})
                            </h4>
                            <div className="space-y-1.5">
                              {template.variables.map((v, i) => (
                                <div
                                  key={i}
                                  className="bg-white border border-gray-200 rounded px-3 py-2"
                                >
                                  <code className="text-xs text-green-700 font-mono">
                                    {v.tag}
                                  </code>
                                  <p className="text-[10px] text-gray-500 mt-0.5">
                                    {v.description}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Conditional Blocks */}
                          {template.conditionals.length > 0 && (
                            <div>
                              <h4 className="text-xs font-semibold text-gray-700 mb-2">
                                Conditional Blocks ({template.conditionals.length})
                              </h4>
                              <div className="space-y-1.5">
                                {template.conditionals.map((c, i) => (
                                  <div
                                    key={i}
                                    className="bg-white border border-yellow-200 rounded px-3 py-2"
                                  >
                                    <code className="text-xs text-yellow-700 font-mono">
                                      {c.condition}
                                    </code>
                                    <p className="text-[10px] text-gray-500 mt-0.5">
                                      {c.description}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="px-5 py-3 border-t border-gray-100 flex gap-2">
                        <button
                          onClick={() => copyToClipboard(template.subject)}
                          className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
                        >
                          Copy Subject
                        </button>
                        <button
                          onClick={() => copyToClipboard(template.htmlBody)}
                          className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
                        >
                          Copy HTML
                        </button>
                        <button
                          onClick={() => copyToClipboard(template.plainText)}
                          className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
                        >
                          Copy Plain Text
                        </button>
                        <button
                          onClick={() => {
                            const blob = new Blob([template.htmlBody], { type: "text/html" });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement("a");
                            a.href = url;
                            a.download = `${template.templateName}.html`;
                            a.click();
                            URL.revokeObjectURL(url);
                          }}
                          className="px-3 py-1.5 text-xs font-medium text-white bg-green-600 rounded hover:bg-green-700 transition-colors"
                        >
                          Download HTML
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Empty State */}
      {templates.length === 0 && !loading && (
        <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
          <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-sm font-semibold text-gray-900 mb-1">
            Generate Klaviyo-Ready Email Copy
          </h3>
          <p className="text-xs text-gray-500 max-w-md mx-auto">
            Select a product category and email position above, then click Generate.
            Each template includes dynamic Klaviyo tags, conditional blocks, and
            HTML ready to paste into Klaviyo.
          </p>
          <div className="mt-6 grid grid-cols-3 gap-3 max-w-lg mx-auto text-left">
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs font-semibold text-gray-700">11 Positions</p>
              <p className="text-[10px] text-gray-500">E1–E11 across 45 days</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs font-semibold text-gray-700">14 Categories</p>
              <p className="text-[10px] text-gray-500">Full nurture per category</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs font-semibold text-gray-700">Klaviyo Tags</p>
              <p className="text-[10px] text-gray-500">Dynamic personalization</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
