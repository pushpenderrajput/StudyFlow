"use server";

import { z } from "zod";
import { importStudyPlan } from "@/ai/flows/import-study-plan";
import type { Task } from "@/lib/types";

const importSourceSchema = z.object({
  source: z.union([
    z.object({
      type: z.literal("file"),
      dataUri: z.string(),
    }),
    z.object({
      type: z.literal("text"),
      content: z.string(),
    }),
  ]),
});

export async function handleImport(input: z.infer<typeof importSourceSchema>): Promise<{ success: boolean; tasks: Omit<Task, 'id' | 'completed'>[]; error?: string; }> {
  try {
    let documentDataUri: string;

    if (input.source.type === 'file') {
      documentDataUri = input.source.dataUri;
    } else {
      // For text, create a data URI from plain text
      const base64Content = Buffer.from(input.source.content).toString('base64');
      documentDataUri = `data:text/plain;base64,${base64Content}`;
    }

    const result = await importStudyPlan({ documentDataUri });

    if (result && result.tasks) {
       const validatedTasks = result.tasks.map(task => ({
        ...task,
        deadline: new Date(task.deadline).toISOString(),
       })).filter(task => !isNaN(new Date(task.deadline).getTime()));

      return { success: true, tasks: validatedTasks };
    }
    return { success: false, tasks: [], error: "Failed to parse study plan." };
  } catch (e: any) {
    console.error(e);
    // Provide a more specific error if available
    const message = e.message || "An unexpected error occurred during import.";
    return { success: false, tasks: [], error: message };
  }
}
