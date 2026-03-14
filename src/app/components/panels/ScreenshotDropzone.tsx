"use client";

import React, { useRef, useState } from "react";
import { Upload, ImageIcon, Loader2, Wand2 } from "lucide-react";
import { toast } from "sonner";

interface ScreenshotDropzoneProps {
  onResult: (json: string) => void;
}

export default function ScreenshotDropzone({ onResult }: ScreenshotDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [prompt, setPrompt] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const processFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file (PNG, JPG, WebP)");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result as string;
      setPreview(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const analyzeImage = async () => {
    if (!preview) return;
    setIsProcessing(true);
    try {
      const [, base64] = preview.split(",");
      const mimeType = preview.split(";")[0].split(":")[1];
      const resp = await fetch("/api/generate/vision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: base64, mimeType, prompt }),
      });

      if (!resp.ok) throw new Error("Vision API failed");
      const data = await resp.json();
      if (data.error) throw new Error(data.error);
      onResult(data.result);
      toast.success("Layout reconstructed from screenshot!");
    } catch (e) {
      console.error(e);
      toast.error("Failed to analyze screenshot. Try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-4">
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => { e.preventDefault(); setIsDragging(false); const f = e.dataTransfer.files[0]; if (f) processFile(f); }}
        onClick={() => inputRef.current?.click()}
        className={`relative cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition-all ${
          isDragging ? "border-violet-400 bg-violet-50 scale-[1.02]" : "border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-slate-100"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) processFile(f); }}
        />
        {preview ? (
          <div className="relative">
            <img src={preview} alt="Screenshot preview" className="mx-auto max-h-48 rounded-xl object-contain" />
            <p className="mt-3 text-[11px] text-slate-500">Click to change screenshot</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm text-violet-500">
              <ImageIcon size={24} />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-700">Drop a screenshot here</p>
              <p className="text-xs text-slate-400 mt-1">PNG, JPG, WebP — any webpage screenshot or wireframe</p>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-violet-100 px-4 py-2 text-[11px] font-semibold text-violet-700">
              <Upload size={12} />
              Browse files
            </div>
          </div>
        )}
      </div>

      {preview && (
        <div className="space-y-3">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Optional: 'Make it dark themed' or 'Keep the hero layout but modernize it'"
            rows={2}
            className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20"
          />
          <button
            onClick={analyzeImage}
            disabled={isProcessing}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 py-3 text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-60 shadow-[0_8px_30px_-8px_rgba(124,58,237,0.6)]"
          >
            {isProcessing ? (
              <><Loader2 size={16} className="animate-spin" /> Analyzing with GPT-4o Vision…</>
            ) : (
              <><Wand2 size={16} /> Reconstruct Layout</>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
