"use client";

import { useParams } from "next/navigation";
import { useCanvasStore, CanvasComponent } from "@/state/useCanvasStore";

export default function CanvasPreviewPage() {
  const params = useParams() as { id: string };
  const { projects } = useCanvasStore();
  const project = projects[params.id];

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="bg-white border border-slate-200 rounded-lg px-4 py-3 text-sm text-slate-600">
          Project not found.
        </div>
      </div>
    );
  }

  const components = project.components;
  const rootId = project.rootComponent;

  // Recursive renderer - only uses CanvasStore
  const renderComponent = (
    componentId: string | null,
    depth: number = 0
  ): React.ReactNode => {
    if (!componentId || depth > 20) return null;

    const component = components[componentId];
    if (!component) return null;

    // Build style from props
    const style: React.CSSProperties = {
      display: component.props.display || "block",
      padding: component.props.padding,
      margin: component.props.margin,
      backgroundColor: component.props.backgroundColor,
      color: component.props.color,
      fontSize: component.props.fontSize,
      fontWeight: component.props.fontWeight as any,
      textAlign: component.props.textAlign as any,
      border: component.props.border,
      borderRadius: component.props.borderRadius,
      width: component.props.width,
      height: component.props.height,
      minHeight: component.props.minHeight,
      maxWidth: component.props.maxWidth,
      gap: component.props.gap,
      flexDirection: component.props.flexDirection,
      gridTemplateColumns: component.props.gridTemplateColumns,
      boxShadow: component.props.boxShadow,
      opacity: component.props.opacity,
    };

    // Render children recursively
    const children = component.children
      .map((childId) => renderComponent(childId, depth + 1))
      .filter(Boolean);

    // Component type mapping
    switch (component.type) {
      case "container":
      case "div":
        return (
          <div key={componentId} style={style}>
            {children}
          </div>
        );

      case "button":
        return (
          <button
            key={componentId}
            style={style}
            className="cursor-pointer hover:opacity-80 transition-opacity"
          >
            {component.props.text || "Button"}
          </button>
        );

      case "text":
      case "p":
        return (
          <p key={componentId} style={style}>
            {component.props.text || "Text"}
          </p>
        );

      case "heading":
      case "h1":
      case "h2":
      case "h3":
        return (
          <h2 key={componentId} style={style}>
            {component.props.text || "Heading"}
          </h2>
        );

      case "image":
      case "img":
        return (
          <img
            key={componentId}
            src={component.props.src || "https://via.placeholder.com/200x150"}
            alt={component.props.alt || "Image"}
            style={style}
          />
        );

      case "input":
        return (
          <input
            key={componentId}
            type={component.props.type || "text"}
            placeholder={component.props.placeholder || "Enter text..."}
            style={style}
            disabled
          />
        );

      case "card":
        return (
          <div
            key={componentId}
            style={{
              ...style,
              border: style.border || "1px solid #e2e8f0",
              borderRadius: style.borderRadius || "8px",
              boxShadow: style.boxShadow || "0 1px 3px rgba(0,0,0,0.1)",
              padding: style.padding || "16px",
            }}
          >
            {children}
          </div>
        );

      case "grid":
        return (
          <div
            key={componentId}
            style={{
              ...style,
              display: "grid",
              gridTemplateColumns:
                style.gridTemplateColumns || "repeat(3, 1fr)",
              gap: style.gap || "16px",
            }}
          >
            {children}
          </div>
        );

      case "flex":
        return (
          <div
            key={componentId}
            style={{
              ...style,
              display: "flex",
              flexDirection: (style.flexDirection as any) || "row",
              gap: style.gap || "16px",
            }}
          >
            {children}
          </div>
        );

      case "section":
        return (
          <section key={componentId} style={style}>
            {children}
          </section>
        );

      case "header":
        return (
          <header key={componentId} style={style}>
            {children}
          </header>
        );

      case "footer":
        return (
          <footer key={componentId} style={style}>
            {children}
          </footer>
        );

      default:
        return (
          <div key={componentId} style={style}>
            {children}
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-slate-900">
              {project.name}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Preview — {Object.keys(components).length} components
            </p>
          </div>
          <button
            onClick={() => (window.location.href = `/builder/${params.id}`)}
            className="text-xs px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Edit
          </button>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-6 min-h-[500px] overflow-auto">
          {rootId ? (
            renderComponent(rootId)
          ) : Object.keys(components).length > 0 ? (
            <div className="space-y-4">
              {Object.keys(components).map((key) => (
                <div key={key}>{renderComponent(key)}</div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-slate-400">
                <p>No components added yet</p>
                <p className="text-xs mt-1">
                  Add components in the builder to see them here
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
