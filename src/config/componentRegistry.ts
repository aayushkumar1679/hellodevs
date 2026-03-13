// src/config/componentRegistry.ts
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

  // ✅ NEW (optional)
  blueprint?: BlueprintNode;
}

export const COMPONENT_LIBRARY: ComponentDefinition[] = [
  // LAYOUT
  {
    type: "section",
    label: "Section",
    description: "Responsive layout section (content wrapper).",
    category: "layout",
    allowChildren: true,
    isLayout: true,
    tags: ["wrapper", "responsive"],
    defaultCss: {
      display: "block",
      padding: "96px 32px",
      width: "100%",
      boxSizing: "border-box",
    },
  },
  {
    type: "container",
    label: "Container",
    description: "Max-width container (centered content).",
    category: "layout",
    allowChildren: true,
    isLayout: true,
    tags: ["container", "layout"],
    defaultCss: {
      width: "100%",
      maxWidth: "1180px",
      margin: "0 auto",
      padding: "0 20px",
      boxSizing: "border-box",
    },
  },
  {
    type: "flex-row",
    label: "Row (flex)",
    description: "Flexible horizontal row (use for columns).",
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
    label: "Column (flex)",
    description: "Vertical stack container.",
    category: "layout",
    allowChildren: true,
    isLayout: true,
    tags: ["flex", "column"],
    defaultCss: {
      display: "flex",
      flexDirection: "column",
      gap: "20px",
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
      gap: "24px",
    },
  },
  {
    type: "spacer",
    label: "Spacer",
    description: "Empty spacer (vertical).",
    category: "layout",
    defaultCss: {
      display: "block",
      height: "24px",
    },
  },
  {
    type: "divider",
    label: "Divider",
    description: "Horizontal divider line.",
    category: "layout",
    defaultCss: {
      height: "1px",
      backgroundColor: "#e6eef8",
      margin: "24px 0",
    },
  },

  // NAVIGATION
  {
    type: "navbar",
    label: "Navbar",
    description: "Top navigation with logo + links + CTA.",
    category: "navigation",
    allowChildren: true,
    isLayout: true,
    tags: ["header", "topbar"],
    defaultProps: {
      brand: { text: "Polyglot", href: "/" },
      links: [
        { label: "Product", href: "#product" },
        { label: "Pricing", href: "#pricing" },
        { label: "Customers", href: "#customers" },
      ],
      cta: { text: "Start building", href: "#" },
      sticky: true,
    },
    defaultCss: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "18px 24px",
      background: "rgba(255,255,255,0.72)",
      border: "1px solid rgba(255,255,255,0.75)",
      borderRadius: "24px",
      boxShadow: "0 24px 50px -34px rgba(15,23,42,0.35)",
      backdropFilter: "blur(16px)",
      gap: "20px",
    },
  },

  // HERO / MARKETING
  {
    type: "hero",
    label: "Hero (Marketing)",
    description:
      "Large hero section with heading, description, CTAs and illustration.",
    category: "marketing",
    allowChildren: false,
    tags: ["hero", "landing", "marketing"],
    defaultProps: {
      title: "Design and ship premium websites from a single prompt.",
      subtitle:
        "Generate a launch-ready page, refine it visually, and export production-friendly code without losing control.",
      ctaPrimary: { text: "Start building", href: "#" },
      ctaSecondary: { text: "See how it works", href: "#" },
      image: {
        src: "https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg",
        alt: "Modern workspace illustration",
      },
    },
    defaultCss: {
      padding: "0",
    },

    // ⭐ HERO BLUEPRINT (NEW)
    blueprint: {
      type: "section",
      css: {
        padding: "120px 32px 88px",
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
                gap: "48px",
              },
              children: [
                {
                  type: "flex-column",
                  css: {
                    gap: "20px",
                    maxWidth: "560px",
                  },
                  children: [
                    {
                      type: "badge",
                      props: { text: "Prompt-first web creation" },
                      css: {
                        background: "rgba(251,191,36,0.16)",
                        color: "#92400e",
                        borderRadius: "999px",
                        width: "fit-content",
                      },
                    },
                    {
                      type: "heading",
                      props: {
                        level: 1,
                        text: "Design and ship premium websites from a single prompt.",
                      },
                      css: {
                        fontSize: "64px",
                        fontWeight: "800",
                        lineHeight: "0.98",
                        letterSpacing: "-0.04em",
                      },
                    },
                    {
                      type: "text",
                      props: {
                        text: "Generate a launch-ready page, refine it visually, and export production-friendly code without losing control.",
                      },
                      css: {
                        fontSize: "18px",
                        lineHeight: "1.7",
                        color: "#475569",
                      },
                    },
                    {
                      type: "flex-row",
                      css: { gap: "14px" },
                      children: [
                        {
                          type: "button",
                          props: {
                            text: "Start building",
                            variant: "primary",
                          },
                        },
                        {
                          type: "button",
                          props: {
                            text: "See how it works",
                            variant: "secondary",
                          },
                        },
                      ],
                    },
                  ],
                },
                {
                  type: "image",
                  props: {
                    src: "https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg",
                    alt: "Hero illustration",
                  },
                  css: {
                    width: "100%",
                    maxWidth: "520px",
                    minHeight: "420px",
                    borderRadius: "32px",
                    boxShadow: "0 40px 90px -50px rgba(15,23,42,0.45)",
                    transform:
                      "perspective(1200px) rotateX(10deg) rotateY(-10deg)",
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
    description: "A ready-made three-column feature section.",
    category: "marketing",
    allowChildren: false,
    tags: ["features", "grid", "section"],
    blueprint: {
      type: "section",
      css: { padding: "88px 32px" },
      children: [
        {
          type: "container",
          children: [
            {
              type: "flex-column",
              css: { gap: "18px", margin: "0 0 32px" },
              children: [
                {
                  type: "heading",
                  props: { text: "Everything needed to go from prompt to production" },
                  css: { fontSize: "42px", fontWeight: "800", maxWidth: "720px" },
                },
                {
                  type: "text",
                  props: {
                    text: "Give the AI a direction, refine visually on the canvas, and export a polished result with clarity.",
                  },
                  css: { fontSize: "18px", color: "#475569", maxWidth: "760px" },
                },
              ],
            },
            {
              type: "grid",
              css: { gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "24px" },
              children: [
                {
                  type: "card",
                  css: {
                    padding: "28px",
                    borderRadius: "28px",
                    background: "linear-gradient(180deg,#ffffff 0%,#f8fafc 100%)",
                    boxShadow: "0 24px 50px -36px rgba(15,23,42,0.3)",
                  },
                  children: [
                    {
                      type: "feature",
                      props: {
                        title: "Prompt to structure",
                        text: "Generate clean sections and content hierarchy in seconds.",
                      },
                    },
                  ],
                },
                {
                  type: "card",
                  css: {
                    padding: "28px",
                    borderRadius: "28px",
                    background: "linear-gradient(180deg,#ffffff 0%,#f8fafc 100%)",
                    boxShadow: "0 24px 50px -36px rgba(15,23,42,0.3)",
                  },
                  children: [
                    {
                      type: "feature",
                      props: {
                        title: "Visual refinement",
                        text: "Tune spacing, typography, glass, and 3D depth directly on canvas.",
                      },
                    },
                  ],
                },
                {
                  type: "card",
                  css: {
                    padding: "28px",
                    borderRadius: "28px",
                    background: "linear-gradient(180deg,#ffffff 0%,#f8fafc 100%)",
                    boxShadow: "0 24px 50px -36px rgba(15,23,42,0.3)",
                  },
                  children: [
                    {
                      type: "feature",
                      props: {
                        title: "Deterministic export",
                        text: "Download React or HTML that mirrors the canvas instead of placeholder code.",
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
    label: "Testimonial Section",
    description: "A testimonial strip with social proof styling.",
    category: "marketing",
    allowChildren: false,
    tags: ["testimonial", "quote", "social proof"],
    blueprint: {
      type: "section",
      css: { padding: "88px 32px" },
      children: [
        {
          type: "container",
          children: [
            {
              type: "grid",
              css: { gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "24px" },
              children: [
                {
                  type: "card",
                  css: {
                    padding: "28px",
                    borderRadius: "28px",
                    background: "#ffffff",
                    boxShadow: "0 24px 50px -38px rgba(15,23,42,0.28)",
                  },
                  children: [
                    {
                      type: "testimonial",
                      props: {
                        quote:
                          "Polyglot gave our team a real first draft instead of a toy mockup.",
                        author: "Ava Smith",
                        role: "Product Lead",
                      },
                    },
                  ],
                },
                {
                  type: "card",
                  css: {
                    padding: "28px",
                    borderRadius: "28px",
                    background: "#ffffff",
                    boxShadow: "0 24px 50px -38px rgba(15,23,42,0.28)",
                  },
                  children: [
                    {
                      type: "testimonial",
                      props: {
                        quote:
                          "The prompt-to-canvas flow feels much closer to a real product workflow.",
                        author: "Marcus Lee",
                        role: "Studio Founder",
                      },
                    },
                  ],
                },
                {
                  type: "card",
                  css: {
                    padding: "28px",
                    borderRadius: "28px",
                    background: "#ffffff",
                    boxShadow: "0 24px 50px -38px rgba(15,23,42,0.28)",
                  },
                  children: [
                    {
                      type: "testimonial",
                      props: {
                        quote:
                          "We could prompt, tweak, and export without losing the design language.",
                        author: "Nora Patel",
                        role: "Frontend Engineer",
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
    type: "pricing-section",
    label: "Pricing Section",
    description: "A three-tier pricing section with headline.",
    category: "commerce",
    allowChildren: false,
    tags: ["pricing", "plans", "section"],
    blueprint: {
      type: "section",
      css: { padding: "88px 32px" },
      children: [
        {
          type: "container",
          children: [
            {
              type: "flex-column",
              css: { gap: "18px", margin: "0 0 32px", textAlign: "center" },
              children: [
                {
                  type: "heading",
                  props: { text: "Simple pricing for serious shipping" },
                  css: { fontSize: "42px", fontWeight: "800" },
                },
                {
                  type: "text",
                  props: {
                    text: "Start with one prompt and scale into a workflow your team can actually use.",
                  },
                  css: { fontSize: "18px", color: "#475569", maxWidth: "760px", margin: "0 auto" },
                },
              ],
            },
            {
              type: "grid",
              css: { gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "24px" },
              children: [
                {
                  type: "pricing-card",
                  props: {
                    title: "Starter",
                    price: "$19",
                    period: "mo",
                    features: ["1 workspace", "Prompt generation", "HTML export"],
                  },
                  css: {
                    padding: "28px",
                    borderRadius: "28px",
                    background: "#ffffff",
                    boxShadow: "0 24px 50px -38px rgba(15,23,42,0.28)",
                  },
                },
                {
                  type: "pricing-card",
                  props: {
                    title: "Pro",
                    price: "$49",
                    period: "mo",
                    features: ["Unlimited projects", "React export", "3D presets"],
                  },
                  css: {
                    padding: "28px",
                    borderRadius: "28px",
                    background: "linear-gradient(180deg,#fff7ed 0%,#ffffff 100%)",
                    boxShadow: "0 28px 60px -40px rgba(249,115,22,0.35)",
                    transform: "translateY(-8px)",
                  },
                },
                {
                  type: "pricing-card",
                  props: {
                    title: "Team",
                    price: "$99",
                    period: "mo",
                    features: ["Shared workspace", "Priority generation", "Collaboration-ready"],
                  },
                  css: {
                    padding: "28px",
                    borderRadius: "28px",
                    background: "#ffffff",
                    boxShadow: "0 24px 50px -38px rgba(15,23,42,0.28)",
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
    type: "stats-strip",
    label: "Stats Strip",
    description: "A concise KPI strip for launch pages.",
    category: "marketing",
    allowChildren: false,
    tags: ["stats", "numbers", "trust"],
    blueprint: {
      type: "section",
      css: { padding: "32px 32px 0" },
      children: [
        {
          type: "container",
          children: [
            {
              type: "grid",
              css: {
                gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
                gap: "18px",
              },
              children: [
                {
                  type: "card",
                  css: { padding: "24px", borderRadius: "24px", background: "#ffffff" },
                  children: [
                    {
                      type: "heading",
                      props: { level: 3, text: "8s" },
                      css: { fontSize: "32px", fontWeight: "800", marginBottom: "6px" },
                    },
                    {
                      type: "text",
                      props: { text: "Prompt to first draft" },
                    },
                  ],
                },
                {
                  type: "card",
                  css: { padding: "24px", borderRadius: "24px", background: "#ffffff" },
                  children: [
                    {
                      type: "heading",
                      props: { level: 3, text: "90%+" },
                      css: { fontSize: "32px", fontWeight: "800", marginBottom: "6px" },
                    },
                    {
                      type: "text",
                      props: { text: "Export parity target" },
                    },
                  ],
                },
                {
                  type: "card",
                  css: { padding: "24px", borderRadius: "24px", background: "#ffffff" },
                  children: [
                    {
                      type: "heading",
                      props: { level: 3, text: "1 click" },
                      css: { fontSize: "32px", fontWeight: "800", marginBottom: "6px" },
                    },
                    {
                      type: "text",
                      props: { text: "From design to export" },
                    },
                  ],
                },
                {
                  type: "card",
                  css: { padding: "24px", borderRadius: "24px", background: "#ffffff" },
                  children: [
                    {
                      type: "heading",
                      props: { level: 3, text: "3D" },
                      css: { fontSize: "32px", fontWeight: "800", marginBottom: "6px" },
                    },
                    {
                      type: "text",
                      props: { text: "Depth controls built in" },
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
    type: "cta",
    label: "Call to Action",
    description: "Centered CTA strip used for conversions.",
    category: "marketing",
    allowChildren: false,
    tags: ["cta", "conversion"],
    defaultProps: {
      text: "Ready to turn your prompt into a polished website?",
      cta: { text: "Start building", href: "#" },
    },
    defaultCss: {
      padding: "40px 32px",
      textAlign: "center",
      background:
        "linear-gradient(135deg, rgba(255,247,237,1) 0%, rgba(255,255,255,1) 55%, rgba(224,242,254,1) 100%)",
      borderRadius: "32px",
      boxShadow: "0 28px 60px -40px rgba(15,23,42,0.25)",
    },
  },

  // CONTENT
  {
    type: "heading",
    label: "Heading",
    description: "Text heading element",
    category: "content",
    defaultProps: { text: "Section title", level: 2 },
    defaultCss: {
      fontSize: "40px",
      fontWeight: "800",
      lineHeight: "1.05",
      letterSpacing: "-0.03em",
      marginBottom: "12px",
      color: "#0f172a",
    },
  },
  {
    type: "text",
    label: "Text",
    description: "Paragraph text element",
    category: "content",
    defaultProps: { text: "Write something that matters." },
    defaultCss: {
      fontSize: "17px",
      lineHeight: "1.75",
      color: "#475569",
      marginBottom: "12px",
    },
  },
  {
    type: "button",
    label: "Button",
    description:
      "Clickable button - variants supported: primary/secondary/ghost/link",
    category: "content",
    defaultProps: { text: "Click me", variant: "primary", size: "md" },
    defaultCss: {
      padding: "14px 22px",
      background: "linear-gradient(180deg,#0f172a 0%,#1e293b 100%)",
      color: "#ffffff",
      border: "1px solid rgba(15,23,42,0.95)",
      borderRadius: "999px",
      cursor: "pointer",
      fontSize: "14px",
      fontWeight: "700",
      boxShadow: "0 20px 40px -24px rgba(15,23,42,0.75)",
    },
  },
  {
    type: "card",
    label: "Card",
    description: "Content card with shadows and padding.",
    category: "content",
    allowChildren: true,
    defaultProps: { elevation: "medium" },
    defaultCss: {
      padding: "28px",
      background: "linear-gradient(180deg,#ffffff 0%,#f8fafc 100%)",
      border: "1px solid rgba(148,163,184,0.2)",
      borderRadius: "28px",
      boxShadow: "0 28px 60px -42px rgba(15,23,42,0.3)",
      boxSizing: "border-box",
    },
  },
  {
    type: "image",
    label: "Image",
    description: "Image element",
    category: "media",
    defaultProps: {
      src: "https://images.pexels.com/photos/34088/pexels-photo.jpg",
      alt: "Placeholder image",
      ratio: "16:9",
    },
    defaultCss: {
      width: "100%",
      minHeight: "220px",
      objectFit: "cover",
      borderRadius: "28px",
      boxShadow: "0 28px 60px -42px rgba(15,23,42,0.25)",
    },
  },

  // FORM
  {
    type: "form",
    label: "Form",
    description: "Form wrapper container",
    category: "form",
    allowChildren: true,
    defaultCss: {
      display: "flex",
      flexDirection: "column",
      gap: "12px",
      maxWidth: "680px",
    },
  },
  {
    type: "input",
    label: "Input",
    description: "Text input field (with label support).",
    category: "form",
    defaultProps: { placeholder: "Enter text", label: "Label" },
    defaultCss: {
      padding: "10px 12px",
      border: "1px solid #e6edf3",
      borderRadius: "8px",
      fontSize: "14px",
      width: "100%",
      boxSizing: "border-box",
    },
  },
  {
    type: "textarea",
    label: "Textarea",
    description: "Multiline text input",
    category: "form",
    defaultProps: { placeholder: "Enter message", label: "Message" },
    defaultCss: {
      padding: "10px 12px",
      border: "1px solid #e6edf3",
      borderRadius: "8px",
      fontSize: "14px",
      width: "100%",
      minHeight: "120px",
    },
  },

  // FEEDBACK
  {
    type: "badge",
    label: "Badge",
    description: "Small badge component",
    category: "feedback",
    defaultProps: { text: "Beta" },
    defaultCss: {
      display: "inline-block",
      padding: "8px 12px",
      backgroundColor: "rgba(15,23,42,0.08)",
      color: "#0f172a",
      borderRadius: "999px",
      fontSize: "12px",
      fontWeight: "600",
    },
  },
  {
    type: "alert",
    label: "Alert",
    description: "Alert message component",
    category: "feedback",
    defaultProps: { text: "Something happened" },
    allowChildren: true,
    defaultCss: {
      padding: "12px 16px",
      backgroundColor: "#fef3c7",
      border: "1px solid #fcd34d",
      borderRadius: "8px",
      color: "#92400e",
      fontSize: "14px",
    },
  },

  // MARKETING / COMMERCE
  {
    type: "feature",
    label: "Feature (icon + title + text)",
    description: "Single feature item for feature grid.",
    category: "marketing",
    defaultProps: {
      icon: null,
      title: "Powerful editor",
      text: "Fast, accessible, and beautiful.",
    },
    defaultCss: {
      padding: "12px 0",
    },
  },
  {
    type: "testimonial",
    label: "Testimonial",
    description: "Quote, author and avatar.",
    category: "marketing",
    defaultProps: {
      quote: "This product saved hours of work — beautiful and performant.",
      author: "Jane Doe",
      role: "Founder, Example",
      avatar:
        "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg",
    },
    defaultCss: {
      padding: "24px",
      borderRadius: "24px",
      backgroundColor: "#fff",
      border: "1px solid rgba(148,163,184,0.18)",
      boxShadow: "0 24px 50px -38px rgba(15,23,42,0.26)",
    },
  },
  {
    type: "pricing-card",
    label: "Pricing Card",
    description: "Simple pricing card with features and CTA.",
    category: "commerce",
    defaultProps: {
      title: "Pro",
      price: "$9",
      period: "mo",
      features: ["Feature A", "Feature B", "Feature C"],
      cta: { text: "Choose plan", href: "#" },
    },
    defaultCss: {
      padding: "28px",
      borderRadius: "28px",
      border: "1px solid rgba(148,163,184,0.18)",
      backgroundColor: "#fff",
      boxShadow: "0 24px 50px -38px rgba(15,23,42,0.26)",
    },
  },

  // Misc
  {
    type: "product-card",
    label: "Product Card",
    description: "Image + title + price + CTA for commerce.",
    category: "commerce",
    defaultProps: {
      title: "Product name",
      price: "₹499",
      image: "https://images.pexels.com/photos/761963/pexels-photo-761963.jpeg",
      cta: { text: "Add to cart", href: "#" },
    },
    defaultCss: {
      padding: "18px",
      borderRadius: "24px",
      border: "1px solid rgba(148,163,184,0.18)",
      backgroundColor: "#fff",
      boxShadow: "0 24px 50px -38px rgba(15,23,42,0.26)",
    },
  },
];

export const getComponentsByCategory = (category: ComponentCategory) =>
  COMPONENT_LIBRARY.filter((c) => c.category === category);

export const searchComponents = (query: string) => {
  const q = query.toLowerCase();
  return COMPONENT_LIBRARY.filter(
    (c) =>
      c.label.toLowerCase().includes(q) ||
      c.type.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q) ||
      (c.tags || []).some((t) => t.includes(q))
  );
};
