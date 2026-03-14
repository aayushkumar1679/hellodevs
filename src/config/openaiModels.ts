export interface OpenAIModelOption {
  id: string;
  label: string;
  description: string;
  provider?: "openai" | "nvidia";
}

export const OPENAI_MODEL_OPTIONS: OpenAIModelOption[] = [
  {
    id: "gpt-4o",
    label: "GPT-4o (Premium)",
    description: "Most capable model for complex designs and high-end aesthetics.",
    provider: "openai",
  },
  {
    id: "gpt-4o-mini",
    label: "GPT-4o mini (Fast)",
    description: "Speed-optimized model for quick landing page skeletons.",
    provider: "openai",
  },
  {
    id: "microsoft/phi-3.5-mini-instruct",
    label: "NVIDIA Phi-3.5 Mini",
    description: "NVIDIA's edge-optimized model for rapid logic and layout generation.",
    provider: "nvidia",
  },
  {
    id: "tiiuae/falcon3-7b-instruct",
    label: "NVIDIA Falcon 3",
    description: "NVIDIA's creative engine for high-fidelity layouts.",
    provider: "nvidia",
  },
];

export const DEFAULT_OPENAI_MODEL = OPENAI_MODEL_OPTIONS[0].id;
