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

export interface ComponentDefinition {
  type: string;
  label: string;
  description: string;
  category: ComponentCategory;
  defaultProps?: Record<string, any>;
  defaultCss?: Record<string, any>;
  allowChildren?: boolean;
  isLayout?: boolean;
}

export const COMPONENT_LIBRARY: ComponentDefinition[] = [
  // LAYOUT
  {
    type: "section",
    label: "Section",
    description: "Responsive layout section",
    category: "layout",
    allowChildren: true,
    isLayout: true,
    defaultCss: {
      display: "block",
      padding: "40px 24px",
      maxWidth: "1200px",
      margin: "0 auto",
    },
  },
  {
    type: "flex-row",
    label: "Flex Row",
    description: "Horizontal flex container",
    category: "layout",
    allowChildren: true,
    isLayout: true,
    defaultCss: {
      display: "flex",
      gap: "16px",
      alignItems: "center",
      justifyContent: "flex-start",
    },
  },
  {
    type: "flex-column",
    label: "Flex Column",
    description: "Vertical flex container",
    category: "layout",
    allowChildren: true,
    isLayout: true,
    defaultCss: {
      display: "flex",
      flexDirection: "column",
      gap: "12px",
    },
  },
  {
    type: "grid",
    label: "Grid",
    description: "CSS grid container",
    category: "layout",
    allowChildren: true,
    isLayout: true,
    defaultCss: {
      display: "grid",
      gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
      gap: "16px",
    },
  },
  {
    type: "container",
    label: "Container",
    description: "Fixed width container",
    category: "layout",
    allowChildren: true,
    isLayout: true,
    defaultCss: {
      maxWidth: "1280px",
      margin: "0 auto",
      padding: "0 16px",
    },
  },
  {
    type: "spacer",
    label: "Spacer",
    description: "Vertical spacing element",
    category: "layout",
    defaultCss: {
      height: "32px",
      display: "block",
    },
  },
  {
    type: "divider",
    label: "Divider",
    description: "Horizontal divider line",
    category: "layout",
    defaultCss: {
      height: "1px",
      backgroundColor: "#e2e8f0",
      margin: "24px 0",
    },
  },

  // CONTENT
  {
    type: "card",
    label: "Card",
    description: "Content card component",
    category: "content",
    allowChildren: true,
    defaultCss: {
      padding: "24px",
      backgroundColor: "#ffffff",
      border: "1px solid #e5e7eb",
      borderRadius: "8px",
      boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    },
  },
  {
    type: "heading",
    label: "Heading",
    description: "Text heading element",
    category: "content",
    defaultProps: { text: "Section title", level: 2 },
    defaultCss: {
      fontSize: "28px",
      fontWeight: "700",
      marginBottom: "16px",
      color: "#1f2937",
    },
  },
  {
    type: "text",
    label: "Text",
    description: "Paragraph text element",
    category: "content",
    defaultProps: { text: "Lorem ipsum dolor sit amet" },
    defaultCss: {
      fontSize: "16px",
      lineHeight: "1.5",
      color: "#4b5563",
      marginBottom: "12px",
    },
  },
  {
    type: "button",
    label: "Button",
    description: "Clickable button element",
    category: "content",
    defaultProps: { text: "Click me" },
    defaultCss: {
      padding: "10px 24px",
      backgroundColor: "#3b82f6",
      color: "#ffffff",
      border: "none",
      borderRadius: "6px",
      cursor: "pointer",
      fontSize: "14px",
      fontWeight: "500",
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
      gap: "16px",
      maxWidth: "600px",
    },
  },
  {
    type: "input",
    label: "Input",
    description: "Text input field",
    category: "form",
    defaultProps: { placeholder: "Enter text" },
    defaultCss: {
      padding: "8px 12px",
      border: "1px solid #d1d5db",
      borderRadius: "6px",
      fontSize: "14px",
      width: "100%",
    },
  },
  {
    type: "textarea",
    label: "Textarea",
    description: "Multiline text input",
    category: "form",
    defaultProps: { placeholder: "Enter message" },
    defaultCss: {
      padding: "8px 12px",
      border: "1px solid #d1d5db",
      borderRadius: "6px",
      fontSize: "14px",
      width: "100%",
      minHeight: "100px",
      fontFamily: "inherit",
    },
  },

  // FEEDBACK
  {
    type: "badge",
    label: "Badge",
    description: "Small badge component",
    category: "feedback",
    defaultProps: { text: "Badge" },
    defaultCss: {
      display: "inline-block",
      padding: "2px 8px",
      backgroundColor: "#3b82f6",
      color: "#ffffff",
      borderRadius: "12px",
      fontSize: "12px",
      fontWeight: "500",
    },
  },
  {
    type: "alert",
    label: "Alert",
    description: "Alert message component",
    category: "feedback",
    defaultProps: { text: "Alert message" },
    allowChildren: true,
    defaultCss: {
      padding: "12px 16px",
      backgroundColor: "#fef3c7",
      border: "1px solid #fcd34d",
      borderRadius: "6px",
      color: "#92400e",
      fontSize: "14px",
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
      c.description.toLowerCase().includes(q)
  );
};
