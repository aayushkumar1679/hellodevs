import { z } from "zod";

export const projectSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  components: z.record(z.string(), z.any()).optional(),
  designElements: z.record(z.string(), z.any()).optional(),
  rootOrder: z.array(z.string()).optional(),
  rootComponent: z.string().nullable().optional(),
  generationPrompt: z.string().nullable().optional(),
  generationModel: z.string().nullable().optional(),
  generationSummary: z.string().nullable().optional(),
  isPublic: z.boolean().optional(),
});

export type ProjectInput = z.infer<typeof projectSchema>;
