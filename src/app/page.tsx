// ============================================================================
// PPW Email Engine — Landing / Dashboard Shell
// ============================================================================

const FEATURES = [
  {
    name: "Email Copy Generator",
    status: "planned" as const,
    description: "Generate Klaviyo-ready email copy with dynamic tags and conditional blocks.",
  },
  {
    name: "Content-to-Email Pipeline",
    status: "planned" as const,
    description: "Auto-classify content and map it to the 45-day nurture flow.",
  },
  {
    name: "Flow Builder / Status Dashboard",
    status: "planned" as const,
    description: "Track all flows by category, status, and email completion.",
  },
  {
    name: "Klaviyo Sync Layer",
    status: "planned" as const,
    description: "Pull and push Klaviyo state — templates, flows, performance.",
  },
  {
    name: "Framework Knowledge Base",
    status: "planned" as const,
    description: "Naming conventions, tags, categories, and flow architecture.",
  },
  {
    name: "Product Recommendation Engine",
    status: "planned" as const,
    description: "Product-to-quiz mapping across categories and price tiers.",
  },
  {
    name: "Campaign Calendar",
    status: "planned" as const,
    description: "Track campaigns and suggest new ones from published content.",
  },
  {
    name: "Category Completion Tracker",
    status: "planned" as const,
    description: "Bird's-eye view of email marketing readiness per category.",
  },
];

const STATUS_STYLES = {
  planned: "bg-gray-700 text-gray-300",
  building: "bg-yellow-900 text-yellow-300",
  live: "bg-green-900 text-green-300",
};

export default function Home() {
  return (
    <main className="max-w-5xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-2">
          PPW Email Engine
        </h1>
        <p className="text-lg text-gray-400">
          Email marketing command center for Peak Primal Wellness
        </p>
        <div className="mt-4 flex gap-3 text-sm text-gray-500">
          <span>14 Categories</span>
          <span>&middot;</span>
          <span>1,557 Products</span>
          <span>&middot;</span>
          <span>49 Brands</span>
          <span>&middot;</span>
          <span>350+ Content Pieces</span>
        </div>
      </div>

      {/* Feature Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {FEATURES.map((feature, i) => (
          <div
            key={feature.name}
            className="border border-gray-800 rounded-lg p-5 hover:border-gray-600 transition-colors"
          >
            <div className="flex items-start justify-between mb-2">
              <h2 className="text-lg font-semibold">
                <span className="text-gray-500 mr-2 font-mono text-sm">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {feature.name}
              </h2>
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${STATUS_STYLES[feature.status]}`}
              >
                {feature.status}
              </span>
            </div>
            <p className="text-sm text-gray-400">{feature.description}</p>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-16 pt-6 border-t border-gray-800 text-center text-sm text-gray-600">
        PPW Email Engine v0.1.0 &middot; Phase 1: Scaffold
      </div>
    </main>
  );
}
