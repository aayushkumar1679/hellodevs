
export type ComponentCategory =
  | "layout"
  | "navigation"
  | "content"
  | "form"
  | "data"
  | "media"
  | "feedback"
  | "marketing"
  | "commerce"
  | "other";

export type BlueprintNode = {
  type: string;
  props?: Record<string, unknown>;
  css?: Record<string, unknown>;
  children?: BlueprintNode[];
};

export interface ComponentDefinition {
  type: string;
  label: string;
  description: string;
  category: ComponentCategory;
  defaultProps?: Record<string, unknown>;
  defaultCss?: Record<string, unknown>;
  allowChildren?: boolean;
  isLayout?: boolean;
  tags?: string[];
  screenshot?: string;
  blueprint?: BlueprintNode;
}

// ----------------------------------------------------------------------
// DESIGN SYSTEM TOKENS & TYPOGRAPHY METRICS
// ----------------------------------------------------------------------
// Colors:
// Text Primary: #0f172a (Slate 900)
// Text Secondary: #475569 (Slate 600)
// Text Muted: #64748b (Slate 500)
// Background: #ffffff
// Surface: #f8fafc (Slate 50)
// Borders: rgba(15,23,42,0.06)
//
// Typography:
// H1: 56px / 1.1 / -0.04em / 800
// H2: 40px / 1.15 / -0.03em / 700
// H3: 24px / 1.25 / -0.02em / 700
// Lead Text: 18px / 1.6 / 400
// Body Text: 16px / 1.6 / 400
// Small Text: 14px / 1.5 / 500
// ----------------------------------------------------------------------

export const COMPONENT_LIBRARY: ComponentDefinition[] = [
  // ==========================================
  // LAYOUT
  // ==========================================
  {
    type: "section",
    label: "Section",
    description: "Responsive layout section with massive vertical padding.",
    category: "layout",
    allowChildren: true,
    isLayout: true,
    tags: ["wrapper", "responsive"],
    defaultCss: {
      display: "block",
      padding: "96px 32px",
      width: "100%",
      boxSizing: "border-box",
      backgroundColor: "#ffffff",
    },
  },
  {
    type: "container",
    label: "Container",
    description: "Max-width container (1200px centers content).",
    category: "layout",
    allowChildren: true,
    isLayout: true,
    tags: ["container", "layout"],
    defaultCss: {
      width: "100%",
      maxWidth: "1200px",
      margin: "0 auto",
      padding: "0",
      boxSizing: "border-box",
    },
  },
  {
    type: "flex-row",
    label: "Row",
    description: "Flexible horizontal row.",
    category: "layout",
    allowChildren: true,
    isLayout: true,
    tags: ["flex", "row"],
    defaultCss: {
      display: "flex",
      flexDirection: "row",
      gap: "24px",
      alignItems: "center",
      flexWrap: "wrap",
    },
  },
  {
    type: "flex-column",
    label: "Column",
    description: "Vertical stack container.",
    category: "layout",
    allowChildren: true,
    isLayout: true,
    tags: ["flex", "column"],
    defaultCss: {
      display: "flex",
      flexDirection: "column",
      gap: "16px",
    },
  },
  {
    type: "grid",
    label: "Grid",
    description: "CSS grid container (responsive columns).",
    category: "layout",
    allowChildren: true,
    isLayout: true,
    tags: ["grid", "layout"],
    defaultCss: {
      display: "grid",
      gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
      gap: "32px",
    },
  },
  {
    type: "spacer",
    label: "Spacer",
    description: "Empty spacer (vertical).",
    category: "layout",
    defaultCss: {
      display: "block",
      height: "32px",
    },
  },

  // ==========================================
  // NAVIGATION
  // ==========================================
  {
    type: "navbar",
    label: "Navbar",
    description: "Premium glassmorphic top navigation.",
    category: "navigation",
    allowChildren: true,
    isLayout: true,
    tags: ["header", "topbar"],
    defaultProps: {
      brand: { text: "Polyglot", href: "/" },
      links: [
        { label: "Features", href: "#features" },
        { label: "Testimonials", href: "#testimonials" },
        { label: "Pricing", href: "#pricing" },
      ],
      cta: { text: "Get Started", href: "#" },
      sticky: true,
    },
    defaultCss: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "16px 24px",
      margin: "24px auto 0",
      maxWidth: "1200px",
      background: "rgba(255,255,255,0.85)",
      border: "1px solid rgba(15,23,42,0.06)",
      borderRadius: "24px",
      boxShadow: "0 20px 40px -20px rgba(15,23,42,0.08)",
      backdropFilter: "blur(20px)",
      gap: "24px",
      // Important to ensure it stays above Hero if negative margins are used
      position: "relative",
      zIndex: "50",
    },
  },

  // ==========================================
  // MARKETING BLUEPRINTS (COMPOSITE)
  // ==========================================
  {
    type: "hero",
    label: "Hero (Marketing)",
    description: "Massive, high-converting hero section with 3D illustration.",
    category: "marketing",
    allowChildren: false,
    blueprint: {
      type: "section",
      css: {
        padding: "80px 32px 120px",
        backgroundColor: "#ffffff",
        overflow: "hidden",
      },
      children: [
        {
          type: "container",
          children: [
            {
              type: "flex-row",
              css: {
                alignItems: "center",
                justifyContent: "space-between",
                gap: "64px",
                flexWrap: "nowrap", // force side-by-side on desktop
              },
              children: [
                {
                  type: "flex-column",
                  css: {
                    gap: "24px",
                    maxWidth: "580px",
                    flex: "1",
                  },
                  children: [
                    {
                      type: "badge",
                      props: { text: "✨ Launching Polyglot Studio 2.0" },
                      css: {
                        background: "#fffbeb", // amber-50
                        color: "#b45309",      // amber-700
                        border: "1px solid #fde68a", // amber-200
                        borderRadius: "999px",
                        padding: "6px 14px",
                        width: "fit-content",
                        fontSize: "13px",
                        fontWeight: "700",
                        letterSpacing: "0.02em",
                      },
                    },
                    {
                      type: "heading",
                      props: {
                        level: 1,
                        text: "Design premium websites at the speed of thought.",
                      },
                      css: {
                        fontSize: "56px",
                        fontWeight: "800",
                        lineHeight: "1.05",
                        letterSpacing: "-0.04em",
                        color: "#0f172a",
                      },
                    },
                    {
                      type: "text",
                      props: {
                        text: "Stop wrestling with rigid templates. Generate launch-ready pages, refine visually on the canvas, and export production-ready code instantly.",
                      },
                      css: {
                        fontSize: "18px",
                        lineHeight: "1.6",
                        color: "#475569",
                        fontWeight: "400",
                      },
                    },
                    {
                      type: "flex-row",
                      css: { gap: "16px", marginTop: "8px" },
                      children: [
                        {
                          type: "button",
                          props: { text: "Start building across", variant: "primary" },
                          css: {
                            padding: "16px 28px",
                            fontSize: "16px",
                            background: "#0f172a",
                            color: "#ffffff",
                            boxShadow: "0 20px 40px -10px rgba(15,23,42,0.3)",
                          },
                        },
                        {
                          type: "button",
                          props: { text: "View Showcase", variant: "secondary" },
                          css: {
                            padding: "16px 28px",
                            fontSize: "16px",
                            background: "#ffffff",
                            color: "#0f172a",
                            border: "1px solid #cbd5e1",
                            boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
                          },
                        },
                      ],
                    },
                    {
                      type: "text",
                      props: { text: "Used by 10,000+ designers & developers." },
                      css: {
                        fontSize: "13px",
                        color: "#94a3b8",
                        fontWeight: "500",
                        marginTop: "8px",
                      },
                    }
                  ],
                },
                {
                  type: "image",
                  props: {
                    src: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop",
                    alt: "Abstract 3D shapes",
                  },
                  css: {
                    flex: "1",
                    width: "100%",
                    minHeight: "560px",
                    objectFit: "cover",
                    borderRadius: "32px",
                    boxShadow: "0 40px 80px -20px rgba(15,23,42,0.25)",
                    transform: "perspective(1200px) rotateY(-8deg) rotateX(4deg)",
                    border: "8px solid #ffffff",
                  },
                },
              ],
            },
          ],
        },
      ],
    },
  },
  {
    type: "feature-section",
    label: "Feature Grid",
    description: "Three-column premium feature grid.",
    category: "marketing",
    allowChildren: false,
    blueprint: {
      type: "section",
      css: { padding: "120px 32px", backgroundColor: "#f8fafc" },
      children: [
        {
          type: "container",
          children: [
            {
              type: "flex-column",
              css: { gap: "20px", margin: "0 0 64px 0", alignItems: "center", textAlign: "center" },
              children: [
                {
                  type: "badge",
                  props: { text: "Features" },
                  css: {
                    background: "#e2e8f0",
                    color: "#334155",
                    borderRadius: "999px",
                    padding: "6px 14px",
                    fontSize: "13px",
                    fontWeight: "700",
                    letterSpacing: "0.04em",
                    textTransform: "uppercase",
                  },
                },
                {
                  type: "heading",
                  props: { text: "Everything needed to ship faster." },
                  css: { fontSize: "40px", fontWeight: "800", lineHeight: "1.1", letterSpacing: "-0.03em", maxWidth: "600px" },
                },
                {
                  type: "text",
                  props: { text: "AI handles the boilerplate. You handle the polish. Export clean code when you are done." },
                  css: { fontSize: "18px", color: "#475569", maxWidth: "600px", lineHeight: "1.6" },
                },
              ],
            },
            {
              type: "grid",
              css: { gridTemplateColumns: "repeat(3, 1fr)", gap: "32px" },
              children: [
                {
                  type: "card",
                  css: {
                    padding: "40px",
                    borderRadius: "32px",
                    background: "#ffffff",
                    border: "1px solid rgba(15,23,42,0.04)",
                    boxShadow: "0 20px 40px -20px rgba(15,23,42,0.05)",
                  },
                  children: [
                    {
                      type: "image",
                      props: { src: "https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?q=80&w=400&auto=format&fit=crop" },
                      css: { width: "100%", height: "180px", borderRadius: "16px", marginBottom: "24px" }
                    },
                    {
                      type: "feature",
                      props: {
                        title: "Visual Architecture",
                        text: "Drag, drop, and style with an intuitive canvas that translates your vision directly into DOM elements.",
                      },
                    },
                  ],
                },
                {
                  type: "card",
                  css: {
                    padding: "40px",
                    borderRadius: "32px",
                    background: "#ffffff",
                    border: "1px solid rgba(15,23,42,0.04)",
                    boxShadow: "0 20px 40px -20px rgba(15,23,42,0.05)",
                  },
                  children: [
                    {
                      type: "image",
                      props: { src: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=400&auto=format&fit=crop" },
                      css: { width: "100%", height: "180px", borderRadius: "16px", marginBottom: "24px" }
                    },
                    {
                      type: "feature",
                      props: {
                        title: "AI Synthesis",
                        text: "Generate entire sections using top-tier models from OpenAI and NVIDIA. Prompt your way to a layout.",
                      },
                    },
                  ],
                },
                {
                  type: "card",
                  css: {
                    padding: "40px",
                    borderRadius: "32px",
                    background: "#ffffff",
                    border: "1px solid rgba(15,23,42,0.04)",
                    boxShadow: "0 20px 40px -20px rgba(15,23,42,0.05)",
                  },
                  children: [
                    {
                      type: "image",
                      props: { src: "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=400&auto=format&fit=crop" },
                      css: { width: "100%", height: "180px", borderRadius: "16px", marginBottom: "24px" }
                    },
                    {
                      type: "feature",
                      props: {
                        title: "Pixel-Perfect Export",
                        text: "Download clean React or HTML code that exactly matches what you see on the canvas. No weird absolute positioning.",
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  },
  {
    type: "testimonial-section",
    label: "Testimonials",
    description: "Social proof grid with highly styled quote cards.",
    category: "marketing",
    allowChildren: false,
    blueprint: {
      type: "section",
      css: { padding: "120px 32px", backgroundColor: "#ffffff" },
      children: [
        {
          type: "container",
          children: [
            {
              type: "flex-column",
              css: { gap: "16px", margin: "0 0 64px 0", alignItems: "center", textAlign: "center" },
              children: [
                {
                  type: "heading",
                  props: { text: "Loved by thousands of creators." },
                  css: { fontSize: "40px", fontWeight: "800", letterSpacing: "-0.03em" },
                },
              ],
            },
            {
              type: "grid",
              css: { gridTemplateColumns: "repeat(3, 1fr)", gap: "24px" },
              children: [
                {
                  type: "testimonial",
                  props: {
                    quote: "The design quality is world-class. Polyglot completely replaced our Figma-to-code pipeline. We ship weeks faster.",
                    author: "Sarah Jenkins",
                    role: "Design Lead, TechFlow",
                  },
                },
                {
                  type: "testimonial",
                  props: {
                    quote: "I prompted a landing page and it came out looking like an award-winning agency built it. Absolutely mind-blowing.",
                    author: "Marcus Chen",
                    role: "Founder, Zenith",
                  },
                },
                {
                  type: "testimonial",
                  props: {
                    quote: "The visual refinement tools are so intuitive. You get AI speed but retain complete granular control over CSS.",
                    author: "Elena Rodriguez",
                    role: "Frontend Engineer",
                  },
                },
              ],
            },
          ],
        },
      ]
    }
  },
  {
    type: "cta",
    label: "Call to Action",
    description: "Massive dark CTA to finish the page.",
    category: "marketing",
    blueprint: {
      type: "section",
      css: {
        padding: "32px", // padding around the inner box
        backgroundColor: "#ffffff",
      },
      children: [
        {
          type: "container",
          children: [
            {
              type: "flex-column",
              css: {
                background: "radial-gradient(120% 120% at 50% 0%, #1e293b 0%, #020617 100%)",
                borderRadius: "40px",
                padding: "96px 32px",
                textAlign: "center",
                alignItems: "center",
                gap: "32px",
                boxShadow: "0 40px 80px -20px rgba(15,23,42,0.5)",
                border: "1px solid rgba(255,255,255,0.1)",
              },
              children: [
                {
                  type: "heading",
                  props: { text: "Ready to launch your next idea?" },
                  css: { color: "#ffffff", fontSize: "48px", fontWeight: "800", letterSpacing: "-0.03em", maxWidth: "700px" },
                },
                {
                  type: "text",
                  props: { text: "Join the top 1% of creators building the future with Polyglot Studio. Start for free." },
                  css: { color: "rgba(255,255,255,0.7)", fontSize: "20px", maxWidth: "600px" },
                },
                {
                  type: "button",
                  props: { text: "Get Started Now", variant: "primary" },
                  css: {
                    background: "#ffffff",
                    color: "#0f172a",
                    border: "none",
                    padding: "18px 36px",
                    fontSize: "16px",
                    fontWeight: "800",
                    marginTop: "16px",
                  },
                },
              ],
            },
          ]
        }
      ]
    }
  },
  {
    type: "footer",
    label: "Footer",
    description: "Simple clean footer.",
    category: "navigation",
    blueprint: {
      type: "section",
      css: { padding: "64px 32px", backgroundColor: "#ffffff", borderTop: "1px solid #f1f5f9" },
      children: [
        {
          type: "container",
          children: [
            {
              type: "flex-row",
              css: { justifyContent: "space-between", alignItems: "center" },
              children: [
                { type: "heading", props: { text: "Polyglot Studio", level: 3 }, css: { fontSize: "20px", fontWeight: "800", letterSpacing: "-0.02em" } },
                { type: "text", props: { text: "© 2026 Polyglot Inc. All rights reserved." }, css: { fontSize: "14px", color: "#94a3b8", marginBottom: "0" } }
              ]
            }
          ]
        }
      ]
    }
  },

  // ==========================================
  // PRIMITIVES (CONTENT, MEDIA)
  // ==========================================
  {
    type: "heading",
    label: "Heading",
    description: "Text heading element",
    category: "content",
    defaultProps: { text: "Section title", level: 2 },
    defaultCss: {
      fontSize: "40px",
      fontWeight: "800",
      lineHeight: "1.15",
      letterSpacing: "-0.03em",
      color: "#0f172a",
      margin: "0",
    },
  },
  {
    type: "text",
    label: "Text",
    description: "Paragraph text element",
    category: "content",
    defaultProps: { text: "Write something that matters." },
    defaultCss: {
      fontSize: "16px",
      lineHeight: "1.6",
      color: "#475569",
      margin: "0",
    },
  },
  {
    type: "button",
    label: "Button",
    description: "Premium clickable button.",
    category: "content",
    defaultProps: { text: "Click me", variant: "primary", size: "md" },
    defaultCss: {
      padding: "14px 24px",
      background: "#0f172a", // Solid dark slate
      color: "#ffffff",
      border: "1px solid transparent",
      borderRadius: "999px",
      cursor: "pointer",
      fontSize: "15px",
      fontWeight: "700",
      letterSpacing: "0.01em",
      boxShadow: "0 10px 20px -10px rgba(15,23,42,0.3)",
    },
  },
  {
    type: "card",
    label: "Card",
    description: "High quality surface container.",
    category: "content",
    allowChildren: true,
    defaultProps: { elevation: "medium" },
    defaultCss: {
      padding: "32px",
      background: "#ffffff",
      border: "1px solid rgba(15,23,42,0.06)",
      borderRadius: "24px",
      boxShadow: "0 24px 48px -12px rgba(15,23,42,0.05)",
      boxSizing: "border-box",
    },
  },
  {
    type: "image",
    label: "Image",
    description: "Image element",
    category: "media",
    defaultProps: {
      src: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop",
      alt: "Placeholder",
      ratio: "16:9",
    },
    defaultCss: {
      width: "100%",
      minHeight: "240px",
      objectFit: "cover",
      borderRadius: "24px",
    },
  },
  {
    type: "badge",
    label: "Badge",
    description: "Small pill badge",
    category: "feedback",
    defaultProps: { text: "New" },
    defaultCss: {
      display: "inline-block",
      padding: "6px 12px",
      background: "#f1f5f9",
      color: "#334155",
      borderRadius: "999px",
      fontSize: "13px",
      fontWeight: "700",
      letterSpacing: "0.02em",
    },
  },
  {
    type: "testimonial",
    label: "Testimonial Content",
    description: "Review content block",
    category: "marketing",
    blueprint: {
      type: "card",
      css: { padding: "32px", background: "#f8fafc", border: "1px solid rgba(15,23,42,0.05)", boxShadow: "none" },
      children: [
        {
          type: "text",
          props: { text: "“The design quality is world class. We were able to launch weeks ahead of schedule with Polyglot.”" },
          css: { fontSize: "16px", lineHeight: "1.6", fontStyle: "italic", marginBottom: "24px", color: "#334155" },
        },
        {
          type: "flex-row",
          css: { alignItems: "center", gap: "16px", padding: "0" },
          children: [
            {
              type: "image",
              props: { src: "https://i.pravatar.cc/150?u=1" },
              css: { width: "48px", height: "48px", minHeight: "48px", borderRadius: "50%", padding: "0" },
            },
            {
              type: "flex-column",
              css: { gap: "2px", padding: "0" },
              children: [
                { type: "text", props: { text: "Sarah Jenkins" }, css: { fontWeight: "700", fontSize: "15px", color: "#0f172a" } },
                { type: "text", props: { text: "CEO at TechFlow" }, css: { fontSize: "13px", color: "#64748b" } },
              ],
            },
          ],
        },
      ],
    },
  },
  {
    type: "feature",
    label: "Feature Item",
    description: "Icon + Title + Desc pair",
    category: "content",
    blueprint: {
      type: "flex-column",
      css: { gap: "12px", padding: "0" },
      children: [
        { type: "heading", props: { level: 3, text: "Excellent Typography" }, css: { fontSize: "20px", fontWeight: "700", letterSpacing: "-0.02em" } },
        { type: "text", props: { text: "Everything is automatically set in a perfect typographic scale." }, css: { fontSize: "15px", color: "#475569", lineHeight: "1.6" } },
      ],
    },
  },
];
