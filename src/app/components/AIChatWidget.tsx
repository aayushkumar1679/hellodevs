"use client";

import React, { useState, useRef, useEffect } from "react";
import { X, Send, Sparkles, Loader2 } from "lucide-react";
import { useProjectStore } from "@/state/useProjectStore";
import type { PolyglotComponent, PolyglotProject } from "@/state/useProjectStore";
import { useEditorStore } from "@/state/useEditorStore";
import { toast } from "sonner";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

type PolyglotAction =
  | {
      action: "updateDesignSystem";
      updates: PolyglotProject["designSystem"];
    }
  | {
      action: "updateComponent";
      id: string;
      updates: Partial<PolyglotComponent> & {
        cssOverrides?: { base?: Record<string, unknown> };
      };
    }
  | {
      action: "addComponent";
      type: string;
      parentId?: string | null;
    };

const SUGGESTED_PROMPTS = [
  "Why does my hero look cramped?",
  "Make the accent color more vibrant",
  "Add more visual hierarchy to this page",
  "What animations would improve conversion?",
];

export default function AIChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "sys-0",
      role: "assistant",
      content: "👋 Hey! I'm your Polyglot AI Assistant. I know your entire project state — ask me anything about design, conversion, or specific components!",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const currentProject = useProjectStore((s) => s.currentProject);
  const selectedElements = useEditorStore((s) => s.selectedElements);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text?: string) => {
    const content = text ?? input.trim();
    if (!content || isLoading) return;
    setInput("");

    const userMsg: Message = { id: `u-${Date.now()}`, role: "user", content };
    setMessages((m) => [...m, userMsg]);
    setIsLoading(true);

    try {
      const projectContext = currentProject
        ? {
            projectName: currentProject.name,
            componentCount: Object.keys(currentProject.components).length,
            selectedId: selectedElements[0] || null,
            selectedComponent: selectedElements[0]
              ? currentProject.components[selectedElements[0]]?.type
              : null,
            colorPalette: currentProject?.designSystem?.colors ?? null,
            rootComponents: currentProject.rootOrder.map(
              (id) => currentProject.components[id]?.type
            ),
          }
        : null;

      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMsg],
          mode: 'chat',
          chatContext: {
            projectContext: {
              ...projectContext,
              // Include a slimmed down component map with IDs for the AI to reference
              componentInventory: currentProject?.components
                ? Object.values(currentProject.components).map(c => ({
                    id: c.id,
                    type: c.type,
                    label: c.meta.label
                  }))
                : []
            },
            history: messages.slice(-6).map((m) => ({ role: m.role, content: m.content })),
          },
        }),
      });

      if (!response.ok) throw new Error("Request failed");
      if (!response.body) throw new Error("No stream");
      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      const assistantMsgId = `a-${Date.now()}`;
      setMessages((m) => [...m, { id: assistantMsgId, role: "assistant", content: "" }]);

      let fullContent = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        fullContent += chunk;
        
        setMessages((m) =>
          m.map((msg) =>
            msg.id === assistantMsgId
              ? { ...msg, content: fullContent }
              : msg
          )
        );
      }

      // Final check for actions in the complete response
      executeActions(fullContent);
    } catch (error) {
      console.error("AI chat request failed:", error);
      setMessages((m) => [
        ...m,
        { id: `err-${Date.now()}`, role: "assistant", content: "Sorry, I couldn't process that. Please try again." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const executeActions = (text: string) => {
    const actionRegex = /```polyglot-action\n?([\s\S]*?)\n?```/g;
    let match;
    while ((match = actionRegex.exec(text)) !== null) {
      try {
        const actionData = JSON.parse(match[1].trim());
        processAction(actionData);
      } catch (e) {
        console.error("Failed to parse AI action:", e);
      }
    }
  };

  const processAction = (data: unknown) => {
    if (!data || typeof data !== "object") return;
    const action = (data as { action?: string }).action;
    const store = useProjectStore.getState();

    switch (action) {
      case "updateDesignSystem": {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const payload = data as { action: "updateDesignSystem"; updates: any };
        if (!payload.updates) return;
        store.updateProject({ designSystem: payload.updates });
        toast.success("AI updated the design system ✨");
        break;
      }
      case "updateComponent": {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const payload = data as { action: "updateComponent"; id: string; updates: any };
        const targetId =
          payload.id === "selected" ? selectedElements[0] : payload.id;
        if (targetId) {
          // Convert kebab-case props to camelCase for React
          const mappedUpdates = { ...(payload.updates || {}) };
          if (mappedUpdates.cssOverrides?.base) {
            const base = mappedUpdates.cssOverrides.base;
            const normalizedBase: Record<string, unknown> = {};
            Object.entries(base).forEach(([key, val]) => {
              const camelKey = key.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
              normalizedBase[camelKey] = val;
            });
            mappedUpdates.cssOverrides.base = normalizedBase;
          }
          store.updateComponent(targetId, mappedUpdates);
          toast.success("AI modified a component 🛠️");
        }
        break;
      }
      case "addComponent": {
        const payload = data as { action: "addComponent"; type: string; parentId?: string };
        if (!payload.type) return;
        const type = payload.type;
        const parentId = payload.parentId;
        store.addComponent(type, parentId || undefined);
        toast.success(`AI added a ${type} component ➕`);
        break;
      }
      default:
        console.warn("Unknown AI action:", action);
    }
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 to-violet-700 text-white shadow-[0_8px_30px_-5px_rgba(99,102,241,0.7)] transition-all hover:scale-110 hover:shadow-[0_12px_40px_-6px_rgba(139,92,246,0.7)] active:scale-95"
        aria-label="Open AI chat"
      >
        <Sparkles className="h-6 w-6" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col rounded-[28px] border border-slate-200 bg-white shadow-[0_30px_80px_-20px_rgba(15,23,42,0.5)] overflow-hidden"
      style={{ width: 380, height: 560 }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 bg-gradient-to-r from-indigo-600 to-violet-700 px-5 py-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/20">
          <Sparkles className="h-4 w-4 text-white" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold text-white">Polyglot AI</p>
          <p className="text-[10px] text-white/70">Project-aware design assistant</p>
        </div>
        <button onClick={() => setOpen(false)} className="h-7 w-7 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition">
          <X className="h-3.5 w-3.5 text-white" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[90%] rounded-2xl px-4 py-2.5 text-xs leading-6 ${
                msg.role === "user"
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-100 text-slate-800"
              }`}
            >
              {msg.content || (
                <span className="flex items-center gap-2 text-slate-400">
                  <Loader2 size={12} className="animate-spin" /> Thinking…
                </span>
              )}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Suggestions */}
      {messages.length <= 1 && (
        <div className="flex flex-wrap gap-2 px-4 pb-3">
          {SUGGESTED_PROMPTS.map((p) => (
            <button
              key={p}
              onClick={() => sendMessage(p)}
              className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[10px] font-medium text-slate-600 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700"
            >
              {p}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="flex items-center gap-2 border-t border-slate-100 px-4 py-3">
        <input
          className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20"
          placeholder="Ask anything about your design…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
        />
        <button
          onClick={() => sendMessage()}
          disabled={!input.trim() || isLoading}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white transition hover:bg-indigo-700 disabled:opacity-40"
        >
          {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
        </button>
      </div>
    </div>
  );
}
