"use client";

import { useState, useEffect, useCallback } from "react";

// ---------------------------------------------------------------------------
// Types (mirrored from email-styles.ts for client)
// ---------------------------------------------------------------------------

interface EmailColorScheme {
  headerBg: string;
  headerText: string;
  ctaPrimary: string;
  ctaPrimaryText: string;
  ctaSecondary: string;
  ctaSecondaryText: string;
  headingColor: string;
  bodyText: string;
  mutedText: string;
  emailBg: string;
  contentBg: string;
  footerBg: string;
  footerText: string;
  linkColor: string;
  borderColor: string;
  accentColor: string;
}

interface EmailFontConfig {
  headingFont: string;
  bodyFont: string;
  headingSize: number;
  subheadingSize: number;
  bodySize: number;
  smallSize: number;
  lineHeight: number;
  headingWeight: number;
}

interface EmailSpacingConfig {
  headerPadding: number;
  contentPadding: number;
  footerPadding: number;
  ctaPaddingV: number;
  ctaPaddingH: number;
  ctaRadius: number;
  cardRadius: number;
  maxWidth: number;
  sectionGap: number;
}

interface EmailStyleConfig {
  name: string;
  description: string;
  colors: EmailColorScheme;
  fonts: EmailFontConfig;
  spacing: EmailSpacingConfig;
  logoUrl?: string;
  logoMaxWidth?: number;
}

interface Preset {
  key: string;
  name: string;
  description: string;
  colors: EmailColorScheme;
  fonts: EmailFontConfig;
  spacing: EmailSpacingConfig;
}

// ---------------------------------------------------------------------------
// Color field labels
// ---------------------------------------------------------------------------

const COLOR_FIELDS: { key: keyof EmailColorScheme; label: string; group: string }[] = [
  { key: "headerBg", label: "Header Background", group: "Header" },
  { key: "headerText", label: "Header Text", group: "Header" },
  { key: "headingColor", label: "Heading Color", group: "Content" },
  { key: "bodyText", label: "Body Text", group: "Content" },
  { key: "mutedText", label: "Muted Text", group: "Content" },
  { key: "ctaPrimary", label: "Primary Button", group: "Buttons" },
  { key: "ctaPrimaryText", label: "Primary Button Text", group: "Buttons" },
  { key: "ctaSecondary", label: "Secondary Button", group: "Buttons" },
  { key: "ctaSecondaryText", label: "Secondary Button Text", group: "Buttons" },
  { key: "accentColor", label: "Accent / Price", group: "Accents" },
  { key: "linkColor", label: "Link Color", group: "Accents" },
  { key: "borderColor", label: "Borders", group: "Accents" },
  { key: "emailBg", label: "Page Background", group: "Backgrounds" },
  { key: "contentBg", label: "Content Background", group: "Backgrounds" },
  { key: "footerBg", label: "Footer Background", group: "Footer" },
  { key: "footerText", label: "Footer Text", group: "Footer" },
];

const FONT_OPTIONS = [
  "'Helvetica Neue', Arial, sans-serif",
  "Arial, sans-serif",
  "Georgia, 'Times New Roman', serif",
  "'Trebuchet MS', sans-serif",
  "Verdana, Geneva, sans-serif",
  "'Courier New', monospace",
];

const FONT_DISPLAY_NAMES: Record<string, string> = {
  "'Helvetica Neue', Arial, sans-serif": "Helvetica Neue",
  "Arial, sans-serif": "Arial",
  "Georgia, 'Times New Roman', serif": "Georgia (Serif)",
  "'Trebuchet MS', sans-serif": "Trebuchet MS",
  "Verdana, Geneva, sans-serif": "Verdana",
  "'Courier New', monospace": "Courier New",
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function StyleEditorPage() {
  const [presets, setPresets] = useState<Preset[]>([]);
  const [activePreset, setActivePreset] = useState<string>("default");
  const [colors, setColors] = useState<EmailColorScheme | null>(null);
  const [fonts, setFonts] = useState<EmailFontConfig | null>(null);
  const [spacing, setSpacing] = useState<EmailSpacingConfig | null>(null);
  const [previewHtml, setPreviewHtml] = useState("");
  const [loading, setLoading] = useState(true);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"colors" | "fonts" | "spacing">("colors");
  const [copied, setCopied] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Load presets on mount
  useEffect(() => {
    fetch("/api/styles")
      .then((r) => r.json())
      .then((data) => {
        setPresets(data.presets || []);
        const defaultPreset = data.currentStyle;
        if (defaultPreset) {
          setColors(defaultPreset.colors);
          setFonts(defaultPreset.fonts);
          setSpacing(defaultPreset.spacing);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Auto-refresh preview when style changes
  const refreshPreview = useCallback(async () => {
    if (!colors || !fonts || !spacing) return;
    setPreviewLoading(true);
    try {
      const res = await fetch("/api/styles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          style: {
            name: "Custom",
            description: "Custom style",
            colors,
            fonts,
            spacing,
          },
        }),
      });
      const data = await res.json();
      if (data.previewHtml) {
        setPreviewHtml(data.previewHtml);
      }
    } catch {
      // silent
    }
    setPreviewLoading(false);
  }, [colors, fonts, spacing]);

  useEffect(() => {
    const timer = setTimeout(refreshPreview, 300);
    return () => clearTimeout(timer);
  }, [refreshPreview]);

  // Apply a preset
  function applyPreset(key: string) {
    const preset = presets.find((p: { key: string }) => p.key === key);
    if (!preset) return;
    setActivePreset(key);
    setColors({ ...preset.colors });
    setFonts({ ...preset.fonts });
    setSpacing({ ...preset.spacing });
    setHasChanges(false);
  }

  // Color change handler
  function updateColor(field: keyof EmailColorScheme, value: string) {
    if (!colors) return;
    setColors({ ...colors, [field]: value });
    setHasChanges(true);
  }

  // Font change handler
  function updateFont<K extends keyof EmailFontConfig>(field: K, value: EmailFontConfig[K]) {
    if (!fonts) return;
    setFonts({ ...fonts, [field]: value });
    setHasChanges(true);
  }

  // Spacing change handler
  function updateSpacing<K extends keyof EmailSpacingConfig>(field: K, value: EmailSpacingConfig[K]) {
    if (!spacing) return;
    setSpacing({ ...spacing, [field]: value });
    setHasChanges(true);
  }

  // Export style JSON
  function exportStyle() {
    const styleObj = {
      name: "Custom PPW Style",
      description: "Exported from PPW Email Engine Style Editor",
      colors,
      fonts,
      spacing,
      exportedAt: new Date().toISOString(),
    };
    const json = JSON.stringify(styleObj, null, 2);
    navigator.clipboard.writeText(json).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  if (loading || !colors || !fonts || !spacing) {
    return (
      <div className="p-8">
        <div className="animate-pulse text-gray-400">Loading style editor...</div>
      </div>
    );
  }

  // Group color fields
  const colorGroups = COLOR_FIELDS.reduce<Record<string, typeof COLOR_FIELDS>>((acc, field) => {
    if (!acc[field.group]) acc[field.group] = [];
    acc[field.group].push(field);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Email Style Editor</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Customize colors, fonts, and spacing for your email templates
            </p>
          </div>
          <div className="flex items-center gap-3">
            {hasChanges && (
              <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">
                Unsaved changes
              </span>
            )}
            <button
              onClick={exportStyle}
              className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
            >
              {copied ? "Copied!" : "Export Style JSON"}
            </button>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Left panel — Controls */}
        <div className="w-[420px] border-r border-gray-200 bg-white overflow-y-auto" style={{ height: "calc(100vh - 73px)" }}>
          {/* Presets */}
          <div className="p-4 border-b border-gray-100">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Style Presets</h2>
            <div className="grid grid-cols-2 gap-2">
              {presets.map((preset) => (
                <button
                  key={preset.key}
                  onClick={() => applyPreset(preset.key)}
                  className={`text-left p-3 rounded-lg border transition-all ${
                    activePreset === preset.key
                      ? "border-green-500 bg-green-50 ring-1 ring-green-200"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <div
                      className="w-4 h-4 rounded-full border border-gray-200"
                      style={{ backgroundColor: preset.colors.headerBg }}
                    />
                    <div
                      className="w-4 h-4 rounded-full border border-gray-200"
                      style={{ backgroundColor: preset.colors.ctaPrimary }}
                    />
                    <div
                      className="w-4 h-4 rounded-full border border-gray-200"
                      style={{ backgroundColor: preset.colors.accentColor }}
                    />
                  </div>
                  <p className="text-xs font-semibold text-gray-800">{preset.name}</p>
                  <p className="text-[10px] text-gray-400 leading-tight mt-0.5">{preset.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200">
            {(["colors", "fonts", "spacing"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-3 text-sm font-medium transition-colors ${
                  activeTab === tab
                    ? "text-green-700 border-b-2 border-green-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Colors Tab */}
          {activeTab === "colors" && (
            <div className="p-4 space-y-5">
              {Object.entries(colorGroups).map(([group, fields]) => (
                <div key={group}>
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">{group}</h3>
                  <div className="space-y-2">
                    {fields.map((field) => (
                      <div key={field.key} className="flex items-center gap-3">
                        <label className="relative">
                          <input
                            type="color"
                            value={colors[field.key]}
                            onChange={(e) => updateColor(field.key, e.target.value)}
                            className="w-8 h-8 rounded-md border border-gray-300 cursor-pointer appearance-none bg-transparent"
                            style={{ backgroundColor: colors[field.key] }}
                          />
                        </label>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-gray-700">{field.label}</p>
                        </div>
                        <input
                          type="text"
                          value={colors[field.key]}
                          onChange={(e) => updateColor(field.key, e.target.value)}
                          className="w-20 text-xs font-mono bg-gray-50 border border-gray-200 rounded px-2 py-1 text-gray-600"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Fonts Tab */}
          {activeTab === "fonts" && (
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Heading Font</label>
                <select
                  value={fonts.headingFont}
                  onChange={(e) => updateFont("headingFont", e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white"
                >
                  {FONT_OPTIONS.map((f) => (
                    <option key={f} value={f}>{FONT_DISPLAY_NAMES[f] || f}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Body Font</label>
                <select
                  value={fonts.bodyFont}
                  onChange={(e) => updateFont("bodyFont", e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white"
                >
                  {FONT_OPTIONS.map((f) => (
                    <option key={f} value={f}>{FONT_DISPLAY_NAMES[f] || f}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Heading Size</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min={16}
                      max={36}
                      value={fonts.headingSize}
                      onChange={(e) => updateFont("headingSize", parseInt(e.target.value))}
                      className="flex-1 accent-green-600"
                    />
                    <span className="text-xs text-gray-500 w-8">{fonts.headingSize}px</span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Subheading Size</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min={14}
                      max={28}
                      value={fonts.subheadingSize}
                      onChange={(e) => updateFont("subheadingSize", parseInt(e.target.value))}
                      className="flex-1 accent-green-600"
                    />
                    <span className="text-xs text-gray-500 w-8">{fonts.subheadingSize}px</span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Body Size</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min={12}
                      max={20}
                      value={fonts.bodySize}
                      onChange={(e) => updateFont("bodySize", parseInt(e.target.value))}
                      className="flex-1 accent-green-600"
                    />
                    <span className="text-xs text-gray-500 w-8">{fonts.bodySize}px</span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Small Size</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min={9}
                      max={16}
                      value={fonts.smallSize}
                      onChange={(e) => updateFont("smallSize", parseInt(e.target.value))}
                      className="flex-1 accent-green-600"
                    />
                    <span className="text-xs text-gray-500 w-8">{fonts.smallSize}px</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Line Height</label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min={1.2}
                    max={2.0}
                    step={0.05}
                    value={fonts.lineHeight}
                    onChange={(e) => updateFont("lineHeight", parseFloat(e.target.value))}
                    className="flex-1 accent-green-600"
                  />
                  <span className="text-xs text-gray-500 w-8">{fonts.lineHeight.toFixed(2)}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Heading Weight</label>
                <select
                  value={fonts.headingWeight}
                  onChange={(e) => updateFont("headingWeight", parseInt(e.target.value))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white"
                >
                  <option value={400}>Regular (400)</option>
                  <option value={500}>Medium (500)</option>
                  <option value={600}>Semibold (600)</option>
                  <option value={700}>Bold (700)</option>
                  <option value={800}>Extra Bold (800)</option>
                </select>
              </div>
            </div>
          )}

          {/* Spacing Tab */}
          {activeTab === "spacing" && (
            <div className="p-4 space-y-4">
              {([
                { key: "maxWidth" as const, label: "Email Max Width", min: 480, max: 700, unit: "px" },
                { key: "headerPadding" as const, label: "Header Padding", min: 12, max: 48, unit: "px" },
                { key: "contentPadding" as const, label: "Content Padding", min: 16, max: 60, unit: "px" },
                { key: "footerPadding" as const, label: "Footer Padding", min: 12, max: 48, unit: "px" },
                { key: "ctaPaddingV" as const, label: "Button Vertical Padding", min: 8, max: 24, unit: "px" },
                { key: "ctaPaddingH" as const, label: "Button Horizontal Padding", min: 16, max: 48, unit: "px" },
                { key: "ctaRadius" as const, label: "Button Corner Radius", min: 0, max: 24, unit: "px" },
                { key: "cardRadius" as const, label: "Card Corner Radius", min: 0, max: 20, unit: "px" },
                { key: "sectionGap" as const, label: "Section Gap", min: 8, max: 32, unit: "px" },
              ]).map((item) => (
                <div key={item.key}>
                  <label className="block text-xs font-medium text-gray-700 mb-1">{item.label}</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min={item.min}
                      max={item.max}
                      value={spacing[item.key]}
                      onChange={(e) => updateSpacing(item.key, parseInt(e.target.value))}
                      className="flex-1 accent-green-600"
                    />
                    <span className="text-xs text-gray-500 w-12 text-right">
                      {spacing[item.key]}{item.unit}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right panel — Live Preview */}
        <div className="flex-1 overflow-y-auto" style={{ height: "calc(100vh - 73px)" }}>
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-gray-600">Live Preview</h2>
              {previewLoading && (
                <span className="text-xs text-gray-400 animate-pulse">Updating...</span>
              )}
            </div>
            <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white">
              {previewHtml ? (
                <iframe
                  srcDoc={previewHtml}
                  className="w-full border-0"
                  style={{ height: "800px" }}
                  title="Email Preview"
                  sandbox="allow-same-origin"
                />
              ) : (
                <div className="h-96 flex items-center justify-center text-gray-400 text-sm">
                  Loading preview...
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
