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
  visualizationDataUri: z.string().describe(
    'A data URI containing the visualization of the user mental state. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.'
  ),
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
  prompt: `You are an AI assistant specialized in visualizing mental states of users based on their questionnaire responses and chat history.

  Analyze the user's questionnaire responses and chat history to determine their mental state.
  Based on this analysis, generate a visualization that represents the user's mental state, such as a graph or chart. The visualization should be returned as a data URI.
  Also provide a textual summary of your analysis.

  User ID: {{{userId}}}
  Questionnaire Responses: {{{questionnaireResponses}}}
  Chat History: {{{chatHistory}}}

  Here's how to create a data URI:
  1.  Describe the mental state using textual data.
  2. Use a tool to generate the image

  Output should contain both the image data URI (visualizationDataUri) and the analysis summary (analysisSummary). Be sure to set the MIME type appropriately in the data URI.
  The output should be in JSON format.
  Consider using soft lavender (#E6E6FA) as primary color to evoke a sense of calm and introspection, and Muted teal (#708090) as a subtle highlight that complements the lavender, conveying stability and trust.
  Make sure to follow these colours for the visualization
  `, // Added instructions for generating the visualization
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
