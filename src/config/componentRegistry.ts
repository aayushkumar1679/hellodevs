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
  props?: Record<string, any>;
  css?: Record<string, any>;
  children?: BlueprintNode[];
};

export interface ComponentDefinition {
  type: string;
  label: string;
  description: string;
  category: ComponentCategory;
  defaultProps?: Record<string, any>;
  defaultCss?: Record<string, any>;
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
      padding: "48px 24px",
      maxWidth: "1200px",
      margin: "0 auto",
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
      maxWidth: "1200px",
      margin: "0 auto",
      padding: "0 16px",
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
      gap: "16px",
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
      gap: "12px",
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
      gap: "16px",
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
      brand: { text: "Brand", href: "/" },
      links: [
        { label: "Product", href: "#" },
        { label: "Pricing", href: "#" },
        { label: "Docs", href: "#" },
      ],
      cta: { text: "Get started", href: "#" },
      sticky: true,
    },
    defaultCss: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "16px 20px",
      backgroundColor: "transparent",
      gap: "12px",
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
      title: "Build better, faster.",
      subtitle: "A minimal editor for teams to ship content quickly.",
      ctaPrimary: { text: "Get started free", href: "#" },
      ctaSecondary: { text: "See demo", href: "#" },
      image: {
        src: "https://images.pexels.com/photos/270360/pexels-photo-270360.jpeg",
        alt: "Hero illustration",
      },
    },
    defaultCss: {
      padding: "72px 24px",
    },

    // ⭐ HERO BLUEPRINT (NEW)
    blueprint: {
      type: "section",
      css: {
        padding: "72px 24px",
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
                gap: "40px",
              },
              children: [
                {
                  type: "flex-column",
                  css: {
                    gap: "16px",
                    maxWidth: "520px",
                  },
                  children: [
                    {
                      type: "heading",
                      props: { level: 1, text: "Build better, faster." },
                      css: {
                        fontSize: "48px",
                        fontWeight: "800",
                      },
                    },
                    {
                      type: "text",
                      props: {
                        text: "A minimal editor for teams to ship content quickly.",
                      },
                    },
                    {
                      type: "flex-row",
                      css: { gap: "12px" },
                      children: [
                        {
                          type: "button",
                          props: {
                            text: "Get started free",
                            variant: "primary",
                          },
                        },
                        {
                          type: "button",
                          props: {
                            text: "See demo",
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
                    src: "https://images.pexels.com/photos/270360/pexels-photo-270360.jpeg",
                    alt: "Hero illustration",
                  },
                  css: {
                    maxWidth: "480px",
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
    type: "cta",
    label: "Call to Action",
    description: "Centered CTA strip used for conversions.",
    category: "marketing",
    allowChildren: false,
    tags: ["cta", "conversion"],
    defaultProps: {
      text: "Ready to build? Start your free trial today.",
      cta: { text: "Start free", href: "#" },
    },
    defaultCss: {
      padding: "36px 24px",
      textAlign: "center",
      backgroundColor: "#f8fafc",
      borderRadius: "8px",
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
      fontSize: "28px",
      fontWeight: "700",
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
      fontSize: "16px",
      lineHeight: "1.6",
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
      padding: "10px 20px",
      backgroundColor: "#0ea5e9",
      color: "#ffffff",
      border: "none",
      borderRadius: "8px",
      cursor: "pointer",
      fontSize: "14px",
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
      padding: "20px",
      backgroundColor: "#ffffff",
      border: "1px solid rgba(2,6,23,0.04)",
      borderRadius: "12px",
      boxShadow: "0 6px 18px rgba(2,6,23,0.04)",
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
      maxWidth: "100%",
      height: "auto",
      borderRadius: "8px",
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
      padding: "4px 8px",
      backgroundColor: "#06b6d4",
      color: "#ffffff",
      borderRadius: "12px",
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
      padding: "12px",
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
      padding: "18px",
      borderRadius: "8px",
      backgroundColor: "#fff",
      border: "1px solid rgba(2,6,23,0.04)",
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
      padding: "20px",
      borderRadius: "12px",
      border: "1px solid rgba(2,6,23,0.06)",
      backgroundColor: "#fff",
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
      padding: "12px",
      borderRadius: "8px",
      border: "1px solid rgba(2,6,23,0.04)",
      backgroundColor: "#fff",
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
