import { NIM_MODEL_OPTIONS } from "./nimModels";

export interface OpenAIModelOption {
  id: string;
  label: string;
  description: string;
  provider?: "openai" | "nvidia" | "anthropic";
}

export const OPENAI_MODEL_OPTIONS: OpenAIModelOption[] = [
  {
    id: "gpt-4o",
    label: "GPT-4o (Senior Designer)",
    description: "High-end creative output with deep design reasoning.",
    provider: "openai",
  },
  {
    id: "gpt-4o-mini",
    label: "GPT-4o Mini (Fast Layout)",
    description: "Extremely fast generation for basic structures.",
    provider: "openai",
  },
  {
    id: "o1-preview",
    label: "o1 Preview (Architecture God)",
    description: "Intense reasoning for complex multi-page apps.",
    provider: "openai",
  },
];

export const DEFAULT_OPENAI_MODEL = "gpt-4o";
