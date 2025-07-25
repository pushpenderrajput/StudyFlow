'use server';

/**
 * @fileOverview AI agent to extract tasks and deadlines from a study plan document (PDF or text).
 *
 * - importStudyPlan - A function that handles the study plan import process.
 * - ImportStudyPlanInput - The input type for the importStudyPlan function.
 * - ImportStudyPlanOutput - The return type for the importStudyPlan function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ImportStudyPlanInputSchema = z.object({
  documentDataUri: z
    .string()
    .describe(
      "The study plan document (PDF or TXT) as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ImportStudyPlanInput = z.infer<typeof ImportStudyPlanInputSchema>;

const ImportStudyPlanOutputSchema = z.object({
  tasks: z.array(
    z.object({
      taskName: z.string().describe('The name of the task.'),
      deadline: z.string().describe('The deadline for the task (ISO format).'),
    })
  ).describe('A list of tasks extracted from the study plan, with their deadlines.'),
});
export type ImportStudyPlanOutput = z.infer<typeof ImportStudyPlanOutputSchema>;

export async function importStudyPlan(input: ImportStudyPlanInput): Promise<ImportStudyPlanOutput> {
  return importStudyPlanFlow(input);
}

const prompt = ai.definePrompt({
  name: 'importStudyPlanPrompt',
  input: {schema: ImportStudyPlanInputSchema},
  output: {schema: ImportStudyPlanOutputSchema},
  prompt: `You are an AI assistant specialized in extracting study tasks and their deadlines from study plan documents.

You will receive a study plan document as input. Your goal is to identify all individual study tasks and their specific assigned dates.

CRITICAL INSTRUCTIONS:
1.  The current year is {{currentYear}}. When you see a date like "July 26", you MUST interpret it as "July 26, {{currentYear}}".
2.  Assign a specific date to EACH task. For date ranges like "Day 2-3", create separate tasks for "Day 2" and "Day 3" with their corresponding dates.
3.  Output the deadline for each task in a valid ISO 8601 format (e.g., YYYY-MM-DDTHH:mm:ss.sssZ). Default to the beginning of the day if no time is specified.
4.  Do not create tasks for general descriptions, weekly themes, or resource lists. Only extract specific, actionable tasks with clear deadlines.

Output a JSON array of tasks, where each task object has a 'taskName' and a 'deadline' field.

Study Plan Document: {{media url=documentDataUri}}`,
  config: {
    safetySettings: [
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_ONLY_HIGH',
      },
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_LOW_AND_ABOVE',
      },
    ],
  },
});

const importStudyPlanFlow = ai.defineFlow(
  {
    name: 'importStudyPlanFlow',
    inputSchema: ImportStudyPlanInputSchema,
    outputSchema: ImportStudyPlanOutputSchema,
  },
  async input => {
    const {output} = await prompt(input, {
      custom: {currentYear: new Date().getFullYear()},
    });
    return output!;
  }
);
