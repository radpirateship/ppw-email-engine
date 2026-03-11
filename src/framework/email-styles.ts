// ============================================================================
// PPW Email Engine — Email Style Configuration
// Centralized style engine for email template colors, fonts, and spacing.
// Used by both legacy template generator and AI email generator.
// ============================================================================

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface EmailColorScheme {
  /** Header/footer background */
  headerBg: string;
  /** Header text color */
  headerText: string;
  /** Primary CTA button background */
  ctaPrimary: string;
  /** Primary CTA button text */
  ctaPrimaryText: string;
  /** Secondary CTA button background */
  ctaSecondary: string;
  /** Secondary CTA button text */
  ctaSecondaryText: string;
  /** Heading text color */
  headingColor: string;
  /** Body text color */
  bodyText: string;
  /** Muted/secondary text color */
  mutedText: string;
  /** Email body background */
  emailBg: string;
  /** Content card/wrapper background */
  contentBg: string;
  /** Footer background */
  footerBg: string;
  /** Footer text color */
  footerText: string;
  /** Link color */
  linkColor: string;
  /** Border/divider color */
  borderColor: string;
  /** Price/highlight accent color */
  accentColor: string;
}

export interface EmailFontConfig {
  /** Primary font stack for headings */
  headingFont: string;
  /** Font stack for body text */
  bodyFont: string;
  /** Heading size in px */
  headingSize: number;
  /** Subheading size in px */
  subheadingSize: number;
  /** Body text size in px */
  bodySize: number;
  /** Small/caption text size in px */
  smallSize: number;
  /** Body line height multiplier */
  lineHeight: number;
  /** Heading font weight */
  headingWeight: number;
}

export interface EmailSpacingConfig {
  /** Header padding (px) */
  headerPadding: number;
  /** Content area padding (px) */
  contentPadding: number;
  /** Footer padding (px) */
  footerPadding: number;
  /** CTA button vertical padding (px) */
  ctaPaddingV: number;
  /** CTA button horizontal padding (px) */
  ctaPaddingH: number;
  /** CTA button border radius (px) */
  ctaRadius: number;
  /** Product card border radius (px) */
  cardRadius: number;
  /** Max email width (px) */
  maxWidth: number;
  /** Section gap (px) */
  sectionGap: number;
}

export interface EmailStyleConfig {
  /** Human-readable name for this style preset */
  name: string;
  /** Description of the style */
  description: string;
  /** Color configuration */
  colors: EmailColorScheme;
  /** Font configuration */
  fonts: EmailFontConfig;
  /** Spacing configuration */
  spacing: EmailSpacingConfig;
  /** Optional logo URL */
  logoUrl?: string;
  /** Logo max width (px) */
  logoMaxWidth?: number;
  /** Created/updated timestamps */
  createdAt?: string;
  updatedAt?: string;
}

// ---------------------------------------------------------------------------
// Default PPW style (current hardcoded values)
// ---------------------------------------------------------------------------

export const DEFAULT_COLORS: EmailColorScheme = {
  headerBg: "#1a5632",
  headerText: "#ffffff",
  ctaPrimary: "#2d8a4e",
  ctaPrimaryText: "#ffffff",
  ctaSecondary: "#555555",
  ctaSecondaryText: "#ffffff",
  headingColor: "#1a5632",
  bodyText: "#555555",
  mutedText: "#999999",
  emailBg: "#f4f4f4",
  contentBg: "#ffffff",
  footerBg: "#f8f8f8",
  footerText: "#999999",
  linkColor: "#2d8a4e",
  borderColor: "#e5e5e5",
  accentColor: "#2d8a4e",
};

export const DEFAULT_FONTS: EmailFontConfig = {
  headingFont: "'Helvetica Neue', Arial, sans-serif",
  bodyFont: "'Helvetica Neue', Arial, sans-serif",
  headingSize: 22,
  subheadingSize: 18,
  bodySize: 15,
  smallSize: 12,
  lineHeight: 1.6,
  headingWeight: 600,
};

export const DEFAULT_SPACING: EmailSpacingConfig = {
  headerPadding: 24,
  contentPadding: 32,
  footerPadding: 24,
  ctaPaddingV: 14,
  ctaPaddingH: 32,
  ctaRadius: 6,
  cardRadius: 8,
  maxWidth: 600,
  sectionGap: 16,
};

export const DEFAULT_STYLE: EmailStyleConfig = {
  name: "PPW Default",
  description: "The original Peak Primal Wellness email style — clean green and white with warm professionalism.",
  colors: DEFAULT_COLORS,
  fonts: DEFAULT_FONTS,
  spacing: DEFAULT_SPACING,
  logoUrl: "",
  logoMaxWidth: 180,
};

// ---------------------------------------------------------------------------
// Style Presets
// ---------------------------------------------------------------------------

export const STYLE_PRESETS: Record<string, EmailStyleConfig> = {
  default: {
    ...DEFAULT_STYLE,
  },
  modern_dark: {
    name: "Modern Dark",
    description: "Sleek dark header with vibrant teal accents — premium and modern.",
    colors: {
      headerBg: "#1a1a2e",
      headerText: "#e0e0e0",
      ctaPrimary: "#0f9b8e",
      ctaPrimaryText: "#ffffff",
      ctaSecondary: "#374151",
      ctaSecondaryText: "#ffffff",
      headingColor: "#1a1a2e",
      bodyText: "#4a4a4a",
      mutedText: "#9ca3af",
      emailBg: "#f9fafb",
      contentBg: "#ffffff",
      footerBg: "#1a1a2e",
      footerText: "#9ca3af",
      linkColor: "#0f9b8e",
      borderColor: "#e5e7eb",
      accentColor: "#0f9b8e",
    },
    fonts: {
      headingFont: "'Helvetica Neue', Arial, sans-serif",
      bodyFont: "'Helvetica Neue', Arial, sans-serif",
      headingSize: 24,
      subheadingSize: 18,
      bodySize: 15,
      smallSize: 12,
      lineHeight: 1.6,
      headingWeight: 700,
    },
    spacing: { ...DEFAULT_SPACING, ctaRadius: 8 },
  },
  warm_earth: {
    name: "Warm Earth",
    description: "Earthy warm tones with terracotta accents — natural and grounded.",
    colors: {
      headerBg: "#5c3d2e",
      headerText: "#faf3eb",
      ctaPrimary: "#c2703e",
      ctaPrimaryText: "#ffffff",
      ctaSecondary: "#7c6a5c",
      ctaSecondaryText: "#ffffff",
      headingColor: "#5c3d2e",
      bodyText: "#4a4035",
      mutedText: "#9b8b7e",
      emailBg: "#faf6f0",
      contentBg: "#ffffff",
      footerBg: "#f5ebe0",
      footerText: "#9b8b7e",
      linkColor: "#c2703e",
      borderColor: "#e8ddd0",
      accentColor: "#c2703e",
    },
    fonts: {
      headingFont: "Georgia, 'Times New Roman', serif",
      bodyFont: "'Helvetica Neue', Arial, sans-serif",
      headingSize: 24,
      subheadingSize: 18,
      bodySize: 15,
      smallSize: 12,
      lineHeight: 1.7,
      headingWeight: 700,
    },
    spacing: { ...DEFAULT_SPACING, ctaRadius: 4, cardRadius: 6 },
  },
  clean_blue: {
    name: "Clean Blue",
    description: "Crisp blue and white — trustworthy, clinical, health-focused.",
    colors: {
      headerBg: "#1e3a5f",
      headerText: "#ffffff",
      ctaPrimary: "#2563eb",
      ctaPrimaryText: "#ffffff",
      ctaSecondary: "#64748b",
      ctaSecondaryText: "#ffffff",
      headingColor: "#1e3a5f",
      bodyText: "#475569",
      mutedText: "#94a3b8",
      emailBg: "#f1f5f9",
      contentBg: "#ffffff",
      footerBg: "#f8fafc",
      footerText: "#94a3b8",
      linkColor: "#2563eb",
      borderColor: "#e2e8f0",
      accentColor: "#2563eb",
    },
    fonts: {
      headingFont: "'Helvetica Neue', Arial, sans-serif",
      bodyFont: "'Helvetica Neue', Arial, sans-serif",
      headingSize: 22,
      subheadingSize: 18,
      bodySize: 15,
      smallSize: 12,
      lineHeight: 1.6,
      headingWeight: 600,
    },
    spacing: { ...DEFAULT_SPACING, ctaRadius: 4 },
  },
  luxury_gold: {
    name: "Luxury Gold",
    description: "Rich black and gold — ultra-premium positioning for high-ticket items.",
    colors: {
      headerBg: "#1c1c1c",
      headerText: "#d4a853",
      ctaPrimary: "#d4a853",
      ctaPrimaryText: "#1c1c1c",
      ctaSecondary: "#333333",
      ctaSecondaryText: "#d4a853",
      headingColor: "#1c1c1c",
      bodyText: "#444444",
      mutedText: "#888888",
      emailBg: "#fafafa",
      contentBg: "#ffffff",
      footerBg: "#1c1c1c",
      footerText: "#888888",
      linkColor: "#b8942f",
      borderColor: "#e8e0d0",
      accentColor: "#d4a853",
    },
    fonts: {
      headingFont: "Georgia, 'Times New Roman', serif",
      bodyFont: "'Helvetica Neue', Arial, sans-serif",
      headingSize: 24,
      subheadingSize: 18,
      bodySize: 15,
      smallSize: 12,
      lineHeight: 1.65,
      headingWeight: 700,
    },
    spacing: { ...DEFAULT_SPACING, ctaRadius: 2, headerPadding: 32, contentPadding: 40 },
  },
};

// ---------------------------------------------------------------------------
// Style → CSS generator
// ---------------------------------------------------------------------------

export function generateEmailCSS(style: EmailStyleConfig): string {
  const { colors, fonts, spacing } = style;
  return `
    body { margin: 0; padding: 0; font-family: ${fonts.bodyFont}; background-color: ${colors.emailBg}; color: ${colors.bodyText}; }
    .wrapper { max-width: ${spacing.maxWidth}px; margin: 0 auto; background-color: ${colors.contentBg}; }
    .header { background-color: ${colors.headerBg}; padding: ${spacing.headerPadding}px ${spacing.contentPadding}px; text-align: center; }
    .header img { max-width: ${style.logoMaxWidth || 180}px; }
    .header h1 { color: ${colors.headerText}; font-size: ${fonts.subheadingSize}px; margin: 8px 0 0; font-weight: ${fonts.headingWeight}; font-family: ${fonts.headingFont}; }
    .content { padding: ${spacing.contentPadding}px; }
    .content h2 { color: ${colors.headingColor}; font-size: ${fonts.headingSize}px; margin-top: 0; font-family: ${fonts.headingFont}; font-weight: ${fonts.headingWeight}; }
    .content h3 { color: ${colors.headingColor}; font-size: ${fonts.subheadingSize}px; font-family: ${fonts.headingFont}; font-weight: ${fonts.headingWeight}; }
    .content p { font-size: ${fonts.bodySize}px; line-height: ${fonts.lineHeight}; color: ${colors.bodyText}; }
    .cta-btn { display: inline-block; background-color: ${colors.ctaPrimary}; color: ${colors.ctaPrimaryText}; padding: ${spacing.ctaPaddingV}px ${spacing.ctaPaddingH}px; text-decoration: none; border-radius: ${spacing.ctaRadius}px; font-weight: 600; font-size: ${fonts.bodySize}px; margin: ${spacing.sectionGap}px 0; }
    .cta-btn:hover { opacity: 0.9; }
    .cta-btn-secondary { display: inline-block; background-color: ${colors.ctaSecondary}; color: ${colors.ctaSecondaryText}; padding: ${spacing.ctaPaddingV}px ${spacing.ctaPaddingH}px; text-decoration: none; border-radius: ${spacing.ctaRadius}px; font-weight: 600; font-size: ${fonts.bodySize}px; margin: ${spacing.sectionGap}px 0; }
    .product-card { border: 1px solid ${colors.borderColor}; border-radius: ${spacing.cardRadius}px; padding: 20px; margin: ${spacing.sectionGap}px 0; text-align: center; }
    .product-card img { max-width: 200px; margin-bottom: 12px; }
    .footer { background-color: ${colors.footerBg}; padding: ${spacing.footerPadding}px ${spacing.contentPadding}px; text-align: center; font-size: ${fonts.smallSize}px; color: ${colors.footerText}; }
    .footer a { color: ${colors.linkColor}; text-decoration: none; }
    .preheader { display: none !important; max-height: 0; overflow: hidden; mso-hide: all; }`;
}

// ---------------------------------------------------------------------------
// Full HTML wrapper using style config
// ---------------------------------------------------------------------------

export function wrapEmailHtml(
  inner: string,
  preheader: string,
  style: EmailStyleConfig = DEFAULT_STYLE
): string {
  const css = generateEmailCSS(style);
  const { colors } = style;

  const logoHtml = style.logoUrl
    ? `<img src="${style.logoUrl}" alt="Peak Primal Wellness" style="max-width: ${style.logoMaxWidth || 180}px;">`
    : "";

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Peak Primal Wellness</title>
  <style>${css}
  </style>
</head>
<body>
  <div class="preheader">${preheader}</div>
  <div class="wrapper">
    <div class="header">
      ${logoHtml}
      <h1>Peak Primal Wellness</h1>
    </div>
    <div class="content">
${inner}
    </div>
    <div class="footer">
      <p>Peak Primal Wellness &middot; Your Home Wellness Experts</p>
      <p><a href="{{ consultation_url }}">Schedule a Free Consultation</a> &middot; <a href="{{ unsubscribe_url }}">Unsubscribe</a></p>
      <p style="font-size: 10px; color: ${colors.mutedText};">You're receiving this because you signed up at peakprimalwellness.com</p>
    </div>
  </div>
</body>
</html>`;
}

// ---------------------------------------------------------------------------
// Inline style helpers (for AI-generated content hints)
// ---------------------------------------------------------------------------

export function getInlineStyleHints(style: EmailStyleConfig): string {
  const { colors, fonts, spacing } = style;
  return `
INLINE STYLE GUIDE (use these exact values):
- Headings: color: ${colors.headingColor}; font-family: ${fonts.headingFont}; font-weight: ${fonts.headingWeight};
- Body text: color: ${colors.bodyText}; font-size: ${fonts.bodySize}px; line-height: ${fonts.lineHeight};
- Accent/prices: color: ${colors.accentColor}; font-weight: 700;
- Primary CTA: class="cta-btn" (auto-styled)
- Secondary CTA: class="cta-btn" with style="background-color: ${colors.ctaSecondary}; color: ${colors.ctaSecondaryText};"
- Links: color: ${colors.linkColor};
- Product cards: class="product-card" (auto-styled)
- Borders: ${colors.borderColor}
- Border radius: ${spacing.ctaRadius}px for buttons, ${spacing.cardRadius}px for cards`;
}
