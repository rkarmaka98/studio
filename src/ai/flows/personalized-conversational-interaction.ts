'use server';

/**
 * @fileOverview Implements a Genkit flow for personalized conversational interactions using questionnaire responses and chat history.
 *
 * - personalizedChatInteraction - A function that handles personalized chat interactions.
 * - PersonalizedChatInput - The input type for the personalizedChatInteraction function.
 * - PersonalizedChatOutput - The return type for the personalizedChatInteraction function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PersonalizedChatInputSchema = z.object({
  questionnaireResponses: z.string().describe('User responses to the questionnaire.'),
  chatHistory: z.string().describe('The user chat history.'),
  userInput: z.string().describe('The latest user input message.'),
});
export type PersonalizedChatInput = z.infer<typeof PersonalizedChatInputSchema>;

const PersonalizedChatOutputSchema = z.object({
  aiResponse: z.string().describe('The AI response based on the user input, questionnaire responses, and chat history.'),
});
export type PersonalizedChatOutput = z.infer<typeof PersonalizedChatOutputSchema>;

export async function personalizedChatInteraction(input: PersonalizedChatInput): Promise<PersonalizedChatOutput> {
  return personalizedChatInteractionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'personalizedChatPrompt',
  input: {schema: PersonalizedChatInputSchema},
  output: {schema: PersonalizedChatOutputSchema},
  prompt: `You are an AI assistant designed to provide personalized conversational interactions.  Your responses should be tailored to the user's specific needs, interests and tone as described by their questionnaire responses and chat history.

Here are the user's responses to the initial questionnaire: {{{questionnaireResponses}}}

Here is the user's past chat history: {{{chatHistory}}}

Now, respond to the following user input, in a way that is consistent with the above information:

{{{userInput}}}`,
});

const personalizedChatInteractionFlow = ai.defineFlow(
  {
    name: 'personalizedChatInteractionFlow',
    inputSchema: PersonalizedChatInputSchema,
    outputSchema: PersonalizedChatOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
