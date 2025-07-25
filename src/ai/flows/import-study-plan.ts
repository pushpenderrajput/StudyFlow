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
  prompt: `You are an AI assistant specialized in extracting study tasks and deadlines from study plans.

You will receive a study plan document as input. Your goal is to identify all study tasks and their associated deadlines.

The current year is {{currentYear}}. When parsing dates like "July 26", assume it's for the current year.

Output a JSON array of tasks, where each task object has a 'taskName' and a 'deadline' (ISO format e.g., YYYY-MM-DDTHH:mm:ss.sssZ) field.

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
