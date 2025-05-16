
"use server";

import { z } from "zod";
import { analyzeInitialResponses } from "@/ai/flows/mental-state-analysis";
import { personalizedChatInteraction } from "@/ai/flows/personalized-conversational-interaction";
import { visualizeMentalState } from "@/ai/flows/visualize-mental-state";
import type { QuestionnaireAnswers, MentalStateAnalysis, ChatMessage, MentalStateVisualizationData, User } from "@/types";

// --- Registration Action ---
const RegisterSchema = z.object({
  username: z.string().min(3).max(20),
  // In a real app, password would be hashed and stored securely.
  // For this mock, we just acknowledge it.
});

export async function registerUser(values: z.infer<typeof RegisterSchema>): Promise<{ success: boolean; message: string; userId?: string }> {
  // Simulate user creation
  console.log("Registering user:", values.username);
  // In a real app, save to DB and get a unique ID.
  const userId = `user_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  return { success: true, message: "Registration successful!", userId };
}

// --- Questionnaire Action ---
const QuestionnaireSchema = z.record(z.string().min(1, "Answer cannot be empty."));

export async function submitQuestionnaire(
  userId: string,
  answers: QuestionnaireAnswers
): Promise<{ success: boolean; message: string; analysis?: MentalStateAnalysis }> {
  console.log("Submitting questionnaire for user:", userId, answers);

  const answerValues = Object.values(answers);
  if (answerValues.some(ans => ans.trim() === "")) {
    return { success: false, message: "All questions must be answered." };
  }

  try {
    // Format answers for the AI flow
    const formattedResponses = Object.entries(answers).map(([key, value]) => `${key}: ${value}`);
    
    const analysisResult = await analyzeInitialResponses({ responses: formattedResponses });
    console.log("AI Analysis Result:", analysisResult);
    
    // Here you would typically store the `analysisResult.mentalState` along with the questionnaire answers for the user.
    // For this exercise, we'll just return it.
    return { success: true, message: "Questionnaire submitted and analyzed!", analysis: analysisResult.mentalState };
  } catch (error) {
    console.error("Error analyzing questionnaire:", error);
    return { success: false, message: "Failed to analyze questionnaire." };
  }
}

// --- Chat Interaction Action ---
export async function handleChatInteraction(
  userId: string,
  userInput: string,
  questionnaireResponses: string, // This should be the stringified version
  chatHistory: string // This should be the stringified version
): Promise<{ success: boolean; aiResponse?: string; message?: string }> {
  console.log("Handling chat for user:", userId);
  try {
    const result = await personalizedChatInteraction({
      userInput,
      questionnaireResponses,
      chatHistory,
    });
    return { success: true, aiResponse: result.aiResponse };
  } catch (error) {
    console.error("Error in personalized chat interaction:", error);
    return { success: false, message: "AI chat interaction failed." };
  }
}

// --- Mental State Visualization Action ---
export async function generateMentalStateVisualization(
  userId: string,
  questionnaireResponses: string, // Stringified
  chatHistory: string // Stringified
): Promise<{ success: boolean; data?: MentalStateVisualizationData; message?: string }> {
  console.log("Generating visualization for user:", userId);
  try {
    const result = await visualizeMentalState({
      userId,
      questionnaireResponses,
      chatHistory,
    });
    return { success: true, data: result };
  } catch (error) {
    console.error("Error generating mental state visualization:", error);
    return { success: false, message: "Failed to generate visualization." };
  }
}
