// use server'
'use server';

/**
 * @fileOverview Analyzes the user's initial questionnaire responses to establish a baseline understanding of their mental state.
 *
 * - analyzeInitialResponses - A function that analyzes the user's initial questionnaire responses.
 * - AnalyzeInitialResponsesInput - The input type for the analyzeInitialResponses function.
 * - AnalyzeInitialResponsesOutput - The return type for the analyzeInitialResponses function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeInitialResponsesInputSchema = z.object({
  responses: z.array(z.string()).describe('An array of strings representing the user responses to the questionnaire.'),
});
export type AnalyzeInitialResponsesInput = z.infer<typeof AnalyzeInitialResponsesInputSchema>;

const MentalStateSchema = z.object({
  overallSentiment: z.string().describe('The overall sentiment of the user based on their responses (e.g., positive, negative, neutral).'),
  stressLevel: z.string().describe('The user s stress level based on their responses (e.g., low, medium, high).'),
  anxietyLevel: z.string().describe('The user s anxiety level based on their responses (e.g., low, medium, high).'),
  depressionLevel: z.string().describe('The user s depression level based on their responses (e.g., low, medium, high).'),
  summary: z.string().describe('A brief summary of the user s mental state based on their responses.'),
});

const AnalyzeInitialResponsesOutputSchema = z.object({
  mentalState: MentalStateSchema.describe('An object containing the analysis of the user s mental state.'),
});
export type AnalyzeInitialResponsesOutput = z.infer<typeof AnalyzeInitialResponsesOutputSchema>;

export async function analyzeInitialResponses(input: AnalyzeInitialResponsesInput): Promise<AnalyzeInitialResponsesOutput> {
  return analyzeInitialResponsesFlow(input);
}

const analyzeInitialResponsesPrompt = ai.definePrompt({
  name: 'analyzeInitialResponsesPrompt',
  input: {schema: AnalyzeInitialResponsesInputSchema},
  output: {schema: AnalyzeInitialResponsesOutputSchema},
  prompt: `Analyze the following questionnaire responses to understand the user's mental state. Provide an overall sentiment, stress level, anxiety level, depression level, and a brief summary.

Responses:
{{#each responses}}
- {{{this}}}
{{/each}}

Output in JSON format:
`,
});

const analyzeInitialResponsesFlow = ai.defineFlow(
  {
    name: 'analyzeInitialResponsesFlow',
    inputSchema: AnalyzeInitialResponsesInputSchema,
    outputSchema: AnalyzeInitialResponsesOutputSchema,
  },
  async input => {
    const {output} = await analyzeInitialResponsesPrompt(input);
    return output!;
  }
);
