export const NIM_BASE_URL = "https://integrate.api.nvidia.com/v1";

export type BuilderTaskType =
  | "layout"
  | "component"
  | "code"
  | "image"
  | "vision"
  | "voice"
  | "safety"
  | "reasoning";

export type BuilderTask = {
  type: BuilderTaskType;
  complexity?: "fast" | "power" | "god";
};

export const NIM_TASK_MODELS = {
  layout_god: "nvidia/llama-nemotron-ultra-253b-v1",
  layout_fast: "mistralai/mistral-small-3.1-24b-instruct-2503",
  layout_power: "qwen/qwen3.5-122b-a10b-instruct",
  component_gen: "nvidia/llama-3.3-nemotron-super-49b-v1-5",
  code_god: "qwen/qwen3-coder-480b-a35b-instruct",
  code_power: "mistralai/devstral-2-123b-instruct",
  code_fast: "ibm/granite-3.3-8b-instruct",
  image_hq: "black-forest-labs/flux.1-dev",
  image_fast: "black-forest-labs/flux.2-klein-4b",
  image_edit: "black-forest-labs/flux.1-kontext-dev",
  image_3d: "microsoft/trellis",
  reason: "deepseek-ai/deepseek-v3.2",
  reason_fast: "nvidia/nvidia-nemotron-nano-9b-v2",
  vision: "nvidia/llama-3.1-nemotron-nano-vl-8b-v1",
  vision_adv: "qwen/qwen3.5-397b-a17b",
  video_reason: "nvidia/cosmos-reason2-8b",
  voice_asr: "nvidia/nemotron-asr-streaming",
  voice_tts: "nvidia/magpie-tts-flow",
  safety: "nvidia/gliner-pii",
  moderation: "meta/llama-guard-4-12b",
} as const;

export const SHEET_MODEL_ENTRIES = [
  { id: "nemotron-asr-streaming", envKey: "NIM_SHEET_MODEL_01_KEY" },
  { id: "flux.2-klein-4b", envKey: "NIM_SHEET_MODEL_02_KEY" },
  { id: "nemotron-ocr-v1", envKey: "NIM_SHEET_MODEL_03_KEY" },
  { id: "nemotron-3-super-120b-a12b", envKey: "NIM_SHEET_MODEL_04_KEY" },
  { id: "llama-nemotron-rerank-1b-v2", envKey: "NIM_SHEET_MODEL_05_KEY" },
  { id: "qwen/qwen3.5-122b-a10b", envKey: "NIM_SHEET_MODEL_06_KEY" },
  { id: "nemotron-table-structure-v1", envKey: "NIM_SHEET_MODEL_07_KEY" },
  { id: "nemotron-page-elements-v3", envKey: "NIM_SHEET_MODEL_08_KEY" },
  { id: "nemotron-graphic-elements-v1", envKey: "NIM_SHEET_MODEL_09_KEY" },
  { id: "llama-nemotron-embed-1b-v2", envKey: "NIM_SHEET_MODEL_10_KEY" },
  { id: "gliner-pii", envKey: "NIM_SHEET_MODEL_11_KEY" },
  { id: "minimaxai/minimax-m2.5", envKey: "NIM_SHEET_MODEL_12_KEY" },
  { id: "qwen/qwen3.5-397b-a17b", envKey: "NIM_SHEET_MODEL_13_KEY" },
  { id: "z-ai/glm-5", envKey: "NIM_SHEET_MODEL_14_KEY" },
  { id: "llama-nemotron-embed-vl-1b-v2", envKey: "NIM_SHEET_MODEL_15_KEY" },
  { id: "minimaxai/minimax-m2.1", envKey: "NIM_SHEET_MODEL_16_KEY" },
  { id: "stepfun-ai/step-3.5-flash", envKey: "NIM_SHEET_MODEL_17_KEY" },
  { id: "moonshotai/kimi-k2.5", envKey: "NIM_SHEET_MODEL_18_KEY" },
  { id: "z-ai/glm-4.7", envKey: "NIM_SHEET_MODEL_19_KEY" },
  {
    id: "nemotron-content-safety-reasoning-4b",
    envKey: "NIM_SHEET_MODEL_20_KEY",
  },
  { id: "nemoretriever-page-elements-v3", envKey: "NIM_SHEET_MODEL_21_KEY" },
  { id: "deepseek-ai/deepseek-v3.2", envKey: "NIM_SHEET_MODEL_22_KEY" },
  { id: "nvidia/nemotron-3-nano-30b-a3b", envKey: "NIM_SHEET_MODEL_23_KEY" },
  { id: "riva-translate-4b-instruct-v1_1", envKey: "NIM_SHEET_MODEL_24_KEY" },
  { id: "z-ai/glm5", envKey: "NIM_SHEET_MODEL_25_KEY" },
] as const;

const MODEL_ID_OVERRIDES: Record<string, string> = {
  "flux.2-klein-4b": "black-forest-labs/flux.2-klein-4b",
  "flux.1-dev": "black-forest-labs/flux.1-dev",
  "flux.1-kontext-dev": "black-forest-labs/flux.1-kontext-dev",
};

const NIM_PREFIXES = [
  "nemotron-",
  "llama-nemotron-",
  "gliner-",
  "riva-",
  "cosmos-",
  "nemoretriever-",
];

export function normalizeNimModelId(id: string): string {
  const trimmed = id.trim();
  if (!trimmed) return trimmed;
  const override = MODEL_ID_OVERRIDES[trimmed];
  if (override) return override;
  if (trimmed.includes("/")) return trimmed;
  if (NIM_PREFIXES.some((prefix) => trimmed.startsWith(prefix))) {
    return `nvidia/${trimmed}`;
  }
  return trimmed;
}

function prettifyModelId(id: string): string {
  const base = id.split("/").pop() || id;
  return base
    .replace(/[-_.]/g, " ")
    .replace(/\b[a-z]/g, (m) => m.toUpperCase());
}

const spreadsheetOptions = SHEET_MODEL_ENTRIES.map((entry) => {
  const normalized = normalizeNimModelId(entry.id);
  return {
    id: normalized,
    label: `NIM ${prettifyModelId(normalized)}`,
    description: "Model from your spreadsheet list.",
    provider: "nvidia" as const,
  };
});

export const NIM_MODEL_OPTIONS = spreadsheetOptions;

const nimIdSet = new Set(NIM_MODEL_OPTIONS.map((opt) => opt.id));

export function isNimModel(id: string): boolean {
  const normalized = normalizeNimModelId(id);
  return nimIdSet.has(normalized);
}

export function getNimApiKeyForModel(modelId: string): string | undefined {
  const normalized = normalizeNimModelId(modelId);
  for (const entry of SHEET_MODEL_ENTRIES) {
    if (normalizeNimModelId(entry.id) === normalized) {
      const key = process.env[entry.envKey];
      if (key) return key;
    }
  }
  return undefined;
}

export function routeToModel(task: BuilderTask): string {
  if (task.type === "layout") {
    if (task.complexity === "god") return NIM_TASK_MODELS.layout_god;
    if (task.complexity === "power") return NIM_TASK_MODELS.layout_power;
    return NIM_TASK_MODELS.layout_fast;
  }
  if (task.type === "component") return NIM_TASK_MODELS.component_gen;
  if (task.type === "code") {
    if (task.complexity === "god") return NIM_TASK_MODELS.code_god;
    if (task.complexity === "power") return NIM_TASK_MODELS.code_power;
    return NIM_TASK_MODELS.code_fast;
  }
  if (task.type === "image") return NIM_TASK_MODELS.image_hq;
  if (task.type === "vision") return NIM_TASK_MODELS.vision;
  if (task.type === "voice") return NIM_TASK_MODELS.voice_asr;
  if (task.type === "safety") return NIM_TASK_MODELS.safety;
  if (task.type === "reasoning") return NIM_TASK_MODELS.reason;
  return NIM_TASK_MODELS.layout_fast;
}
