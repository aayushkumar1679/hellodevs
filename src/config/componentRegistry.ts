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
    type: "pricing-card",
    label: "Pricing Card",
    description: "A single card with title, price, and features.",
    category: "commerce",
    allowChildren: true,
    blueprint: {
      type: "card",
      css: {
        padding: "32px",
        borderRadius: "32px",
        background: "#ffffff",
        boxShadow: "0 30px 60px -40px rgba(15,23,42,0.25)",
        display: "flex",
        flexDirection: "column",
        gap: "24px",
      },
      children: [
        {
          type: "flex-column",
          css: { gap: "8px" },
          children: [
            {
              type: "text",
              props: { text: "STARTER" },
              css: { fontSize: "12px", fontWeight: "700", letterSpacing: "0.1em", color: "#64748b" },
            },
            {
              type: "heading",
              props: { level: 2, text: "$29" },
              css: { fontSize: "40px", fontWeight: "800" },
            },
          ],
        },
        {
          type: "flex-column",
          css: { gap: "12px" },
          children: [
            { type: "text", props: { text: "✓ feature one" }, css: { fontSize: "14px", color: "#475569" } },
            { type: "text", props: { text: "✓ feature two" }, css: { fontSize: "14px", color: "#475569" } },
            { type: "text", props: { text: "✓ feature three" }, css: { fontSize: "14px", color: "#475569" } },
          ],
        },
        {
          type: "button",
          props: { text: "Choose Plan", variant: "primary" },
          css: { width: "100%" },
        },
      ],
    },
  },
  {
    type: "product-card",
    label: "Product Card",
    description: "Image card with title and price.",
    category: "commerce",
    allowChildren: true,
    blueprint: {
      type: "card",
      css: { padding: "0", overflow: "hidden" },
      children: [
        {
          type: "image",
          props: { src: "https://images.pexels.com/photos/761963/pexels-photo-761963.jpeg" },
          css: { height: "220px", borderRadius: "0" },
        },
        {
          type: "flex-column",
          css: { padding: "20px" },
          children: [
            { type: "heading", props: { level: 3, text: "Product Name" }, css: { fontSize: "18px" } },
            { type: "text", props: { text: "$99.00" }, css: { fontWeight: "700" } },
            { type: "button", props: { text: "Add to Bag", variant: "secondary" }, css: { marginTop: "12px" } },
          ],
        },
      ],
    },
  },
  {
    type: "testimonial",
    label: "Testimonial",
    description: "A customer quote card.",
    category: "marketing",
    blueprint: {
      type: "card",
      css: { padding: "32px", background: "#f8fafc", border: "none" },
      children: [
        {
          type: "text",
          props: { text: "“The design quality is world class. We were able to launch weeks ahead of schedule.”" },
          css: { fontSize: "18px", fontStyle: "italic", marginBottom: "20px" },
        },
        {
          type: "flex-row",
          css: { alignItems: "center", gap: "12px" },
          children: [
            {
              type: "image",
              props: { src: "https://i.pravatar.cc/150?u=1" },
              css: { width: "40px", height: "40px", borderRadius: "50%" },
            },
            {
              type: "flex-column",
              css: { gap: "2px" },
              children: [
                { type: "text", props: { text: "Sarah Jenkins" }, css: { fontWeight: "700", fontSize: "14px" } },
                { type: "text", props: { text: "CEO at TechFlow" }, css: { fontSize: "12px", opacity: "0.6" } },
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
    description: "A title and description pair for lists/grids.",
    category: "content",
    blueprint: {
      type: "flex-column",
      css: { gap: "8px" },
      children: [
        { type: "heading", props: { level: 3, text: "Feature title" }, css: { fontSize: "20px" } },
        { type: "text", props: { text: "Description of this capability goes here." }, css: { fontSize: "15px" } },
      ],
    },
  },
  {
    type: "cta",
    label: "Call to Action",
    description: "Centered CTA section.",
    category: "marketing",
    blueprint: {
      type: "section",
      css: {
        background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
        color: "#ffffff",
        padding: "80px 32px",
        textAlign: "center",
      },
      children: [
        {
          type: "container",
          children: [
            {
              type: "flex-column",
              css: { alignItems: "center", gap: "24px" },
              children: [
                {
                  type: "heading",
                  props: { text: "Ready to ship your project?" },
                  css: { color: "inherit", fontSize: "48px" },
                },
                {
                  type: "text",
                  props: { text: "Join 10,000+ creators building with Polyglot." },
                  css: { color: "rgba(255,255,255,0.7)", fontSize: "18px" },
                },
                {
                  type: "button",
                  props: { text: "Get Started Free", variant: "primary" },
                  css: { background: "#ffffff", color: "#0f172a", border: "none" },
                },
              ],
            },
          ],
        },
      ],
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
