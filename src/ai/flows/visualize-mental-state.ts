// src/ai/flows/visualize-mental-state.ts
'use server';

/**
 * @fileOverview Flow to visualize user mental state based on questionnaire and chat history.
 *
 * - visualizeMentalState - A function that visualizes the mental state.
 * - VisualizeMentalStateInput - The input type for the visualizeMentalState function.
 * - VisualizeMentalStateOutput - The return type for the visualizeMentalState function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const VisualizeMentalStateInputSchema = z.object({
  userId: z.string().describe('The ID of the user whose mental state should be visualized.'),
  questionnaireResponses: z.string().describe('The user responses to the questionnaire, stored as a string.'),
  chatHistory: z.string().describe('The user chat history, stored as a string.'),
});

export type VisualizeMentalStateInput = z.infer<typeof VisualizeMentalStateInputSchema>;

const VisualizeMentalStateOutputSchema = z.object({
  barChartData: z.array(
    z.object({
      metric: z.string().describe('The mental state metric (e.g., happy, sad).'),
      score: z.number().min(0).max(10).describe('The score for the metric (0-10).'),
    })
  ).describe('Data for the bar chart, with scores for happy, sad, anxiety, anger, depressed.'),
  analysisSummary: z.string().describe('A summary of the analysis used to generate the visualization.'),
});

export type VisualizeMentalStateOutput = z.infer<typeof VisualizeMentalStateOutputSchema>;

export async function visualizeMentalState(input: VisualizeMentalStateInput): Promise<VisualizeMentalStateOutput> {
  return visualizeMentalStateFlow(input);
}

const prompt = ai.definePrompt({
  name: 'visualizeMentalStatePrompt',
  input: {schema: VisualizeMentalStateInputSchema},
  output: {schema: VisualizeMentalStateOutputSchema},
  prompt: `You are an AI assistant specialized in analyzing mental states.
  Analyze the user's questionnaire responses and chat history.
  Based on this analysis, provide a score (0-10) for each of the following mental state metrics: happy, sad, anxiety, anger, depressed.
  Also provide a textual summary of your analysis.

  User ID: {{{userId}}}
  Questionnaire Responses: {{{questionnaireResponses}}}
  Chat History: {{{chatHistory}}}

  The output should be in JSON format, adhering to the following schema:
  - barChartData: An array of objects, each with 'metric' (string) and 'score' (number 0-10). Include metrics: happy, sad, anxiety, anger, depressed.
  - analysisSummary: A textual summary of your analysis.

  Consider using soft lavender (#E6E6FA) as primary color to evoke a sense of calm and introspection, and Muted teal (#708090) as a subtle highlight that complements the lavender, conveying stability and trust.
  These colors are for context and don't need to be in the JSON output directly, but guide your analysis if relevant.
  `,
});

const visualizeMentalStateFlow = ai.defineFlow(
  {
    name: 'visualizeMentalStateFlow',
    inputSchema: VisualizeMentalStateInputSchema,
    outputSchema: VisualizeMentalStateOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
