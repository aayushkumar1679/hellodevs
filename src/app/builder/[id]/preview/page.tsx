"use client";

import React from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useCanvasStore } from "@/state/useCanvasStore";
import { useDesignStore } from "@/state/useDesignStore";

function PreviewNode({
  componentId,
}: {
  componentId: string;
}) {
  const project = useCanvasStore((state) => state.currentProject);
  const elements = useDesignStore((state) => state.elements);

  const component = project?.components[componentId];
  if (!component) return null;

  const css = elements[componentId]?.cssProperties?.base || {};
  const props = component.props || {};
  const children = component.children.map((childId) => (
    <PreviewNode key={childId} componentId={childId} />
  ));

  switch (component.type) {
    case "section":
      return <section style={css}>{children}</section>;
    case "container":
    case "flex-row":
    case "flex-column":
    case "grid":
    case "card":
    case "form":
      return <div style={css}>{children}</div>;
    case "heading": {
      const tag = `h${Math.min(Math.max(Number(props.level || 2), 1), 6)}`;
      return React.createElement(tag, { style: css }, props.text || "Heading");
    }
    case "text":
      return <p style={css}>{props.text || "Text"}</p>;
    case "button":
      return <button style={css}>{props.text || "Button"}</button>;
    case "image":
      return (
        <img
          style={css}
          src={props.src || "https://images.pexels.com/photos/34088/pexels-photo.jpg"}
          alt={props.alt || "Image"}
        />
      );
    case "input":
      return <input style={css} placeholder={props.placeholder || "Enter text"} />;
    case "textarea":
      return (
        <textarea
          style={css}
          placeholder={props.placeholder || "Write something"}
        />
      );
    case "badge":
      return <span style={css}>{props.text || "Badge"}</span>;
    case "alert":
      return <div style={css}>{props.text || "Alert"}</div>;
    default:
      return <div style={css}>{children}</div>;
  }
}

export default function CanvasPreviewPage() {
  const params = useParams() as { id: string };
  const { projects, setCurrentProject } = useCanvasStore();
  const project = projects[params.id];

  React.useEffect(() => {
    if (params.id) {
      setCurrentProject(params.id);
    }
  }, [params.id, setCurrentProject]);

  if (!project) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="rounded-[24px] border border-slate-200 bg-white px-5 py-4 text-sm text-slate-600 shadow-sm">
          Project not found.
        </div>
      </div>
    );
  }

  const roots = project.rootOrder?.length
    ? project.rootOrder
    : Object.values(project.components).map((component) => component.id);

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)] px-4 py-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-slate-400">
              Preview
            </p>
            <h1 className="mt-1 text-2xl font-semibold text-slate-950">
              {project.name}
            </h1>
          </div>

          <Link
            href={`/builder/${params.id}`}
            className="rounded-full bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Back to builder
          </Link>
        </div>

        <div className="overflow-hidden rounded-[36px] border border-slate-200 bg-white p-6 shadow-[0_32px_80px_-50px_rgba(15,23,42,0.45)]">
          {roots.length > 0 ? (
            <div className="space-y-4">
              {roots.map((rootId) => (
                <PreviewNode key={rootId} componentId={rootId} />
              ))}
            </div>
          ) : (
            <div className="flex min-h-[60vh] items-center justify-center text-center text-slate-500">
              No components added yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
