export interface OpenAIModelOption {
  id: string;
  label: string;
  description: string;
}

export const OPENAI_MODEL_OPTIONS: OpenAIModelOption[] = [
  {
    id: "gpt-4o",
    label: "GPT-4o (Premium)",
    description: "Most capable model for complex designs and high-end aesthetics.",
  },
  {
    id: "gpt-4o-mini",
    label: "GPT-4o mini (Fast)",
    description: "Speed-optimized model for quick landing page skeletons.",
  },
];

export const DEFAULT_OPENAI_MODEL = OPENAI_MODEL_OPTIONS[0].id;
