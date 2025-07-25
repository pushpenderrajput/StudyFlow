"use server";

import { importStudyPlan } from "@/ai/flows/import-study-plan";
import type { Task } from "@/lib/types";
import { z } from "zod";

const importSchema = z.object({
  source: z.union([
    z.object({
      type: z.literal("file"),
      dataUri: z.string().startsWith("data:"),
    }),
    z.object({
      type: z.literal("text"),
      content: z.string().min(10),
    }),
  ]),
});

export async function handleImport(
  input: z.infer<typeof importSchema>
): Promise<{ success: boolean; tasks: Omit<Task, 'id' | 'completed'>[]; error?: string }> {
  const validation = importSchema.safeParse(input);
  if (!validation.success) {
    return { success: false, tasks: [], error: "Invalid input." };
  }

  let documentDataUri: string;
  if (validation.data.source.type === "file") {
    documentDataUri = validation.data.source.dataUri;
  } else {
    // For text, create a data URI
    try {
      const base64Content = Buffer.from(validation.data.source.content).toString('base64');
      documentDataUri = `data:text/plain;base64,${base64Content}`;
    } catch (e) {
      // btoa is not available in server environments, so use Buffer
      const base64Content = Buffer.from(validation.data.source.content).toString('base64');
      documentDataUri = `data:text/plain;base64,${base64Content}`;
    }
  }

  try {
    const result = await importStudyPlan({ documentDataUri });
    return { success: true, tasks: result.tasks };
  } catch (error) {
    console.error("AI plan import failed:", error);
    return { success: false, tasks: [], error: "Failed to parse the study plan. Please check the format and try again." };
  }
}
