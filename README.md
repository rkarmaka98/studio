
# Therapie - Personalized Mental Wellness Companion

## 1. High-Level Overview

Therapie is a Next.js web application designed to be a personalized mental wellness companion. It allows users to:
1.  **Register and Login:** A mock authentication system to simulate user sessions.
2.  **Complete an Initial Questionnaire:** To gather baseline information about the user's mental state and preferences.
3.  **Engage in Personalized Chat:** Interact with an AI assistant whose responses are tailored based on questionnaire answers and chat history.
4.  **Visualize Mental State:** View a graphical representation (bar chart) of their analyzed mental state based on their interactions.

The core idea is to provide a supportive and reflective space for users, leveraging AI to offer personalized insights and interactions.

## 2. Technology Stack

The application is built with a modern, server-centric approach:

*   **Frontend Framework:** Next.js 15+ (App Router)
*   **UI Library:** React 18+
*   **UI Components:** ShadCN UI - A collection of beautifully designed, accessible, and customizable components.
*   **Styling:** Tailwind CSS - Utility-first CSS framework for rapid UI development. Theme customization is managed in `src/app/globals.css`.
*   **AI Integration:** Genkit (v1.x) - Google's toolkit for building AI-powered features, used here for:
    *   Analyzing questionnaire responses.
    *   Generating personalized chat responses.
    *   Analyzing data for mental state visualization.
*   **Language:** TypeScript
*   **Form Handling:** React Hook Form with Zod for validation.
*   **State Management (Client-side):**
    *   Component-level state (`useState`, `useEffect`).
    *   `localStorage` (`src/lib/authStore.ts`) for persisting mock user sessions, questionnaire answers, and chat history.
*   **API/Backend Logic:** Next.js Server Actions - For handling form submissions, AI interactions, and data mutations without explicit API endpoint creation.

## 3. Directory Structure

Key directories and their purpose:

*   **`src/app/`**: Contains all routes using the Next.js App Router.
    *   `layout.tsx`: Root layout for the application.
    *   `globals.css`: Global styles and Tailwind CSS theme customization (HSL variables).
    *   `page.tsx` (root): Landing/authentication prompt page.
    *   `(auth)/` (example of potential route group, though current setup uses simple paths):
        *   `login/page.tsx`: User login page.
        *   `register/page.tsx`: User registration page.
    *   `questionnaire/page.tsx`: Page for users to fill out the initial questionnaire.
    *   `dashboard/page.tsx`: Main dashboard page displaying chat and visualization.
*   **`src/components/`**: Reusable React components.
    *   `ui/`: ShadCN UI components (e.g., Button, Card, Input). These are generally not modified directly but used as building blocks.
    *   `AuthForm.tsx`: Form component for login and registration.
    *   `QuestionnaireForm.tsx`: Form for the initial user questionnaire.
    *   `Logo.tsx`: Application logo component.
    *   `dashboard/`: Components specific to the dashboard.
        *   `ChatInterface.tsx`: Component for AI chat interaction.
        *   `MentalStateVisualization.tsx`: Component for displaying the mental state chart.
*   **`src/lib/`**: Core logic, utilities, and shared constants.
    *   `actions.ts`: Server Actions that handle backend logic (e.g., user registration, questionnaire submission, AI flow invocations).
    *   `authStore.ts`: Mock authentication and data persistence using `localStorage`.
    *   `constants.ts`: Application-wide constants, like questionnaire questions.
    *   `utils.ts`: Utility functions (e.g., `cn` for merging Tailwind classes).
*   **`src/ai/`**: Genkit AI integration.
    *   `genkit.ts`: Genkit global `ai` object initialization and configuration (e.g., selecting the Gemini model).
    *   `dev.ts`: Development server script for Genkit flows.
    *   `flows/`: Contains individual Genkit flows.
        *   `mental-state-analysis.ts`: Flow to analyze initial questionnaire responses.
        *   `personalized-conversational-interaction.ts`: Flow for handling chat.
        *   `visualize-mental-state.ts`: Flow to generate data for mental state visualization.
*   **`src/types/`**: TypeScript type definitions.
    *   `index.ts`: Main file exporting all shared types (User, ChatMessage, etc.).
*   **`public/`**: Static assets (though not heavily used in this template).
*   **`hooks/`**: Custom React hooks.
    *   `use-toast.ts`: Hook for managing toast notifications.
    *   `use-mobile.tsx`: Hook to detect if the user is on a mobile device.

## 4. Core Features & Flows

### 4.1. Authentication (Mocked)

*   **Registration (`/register`):**
    1.  User enters a username and password in `AuthForm`.
    2.  On submit, the `handleSubmit` function in `register/page.tsx` calls the `registerUser` Server Action (`src/lib/actions.ts`).
    3.  `registerUser` (mock) creates a user ID.
    4.  A new `User` object (with `questionnaireCompleted: false`) is stored in `localStorage` via `authStore.setUser()`.
    5.  User is redirected to `/questionnaire`.
*   **Login (`/login`):**
    1.  User enters username and password in `AuthForm`.
    2.  On submit, `handleSubmit` in `login/page.tsx` is called.
    3.  It checks `authStore.getUser()`.
        *   If a stored user exists and the username matches, that user's data (including `questionnaireCompleted` status) is loaded.
        *   Otherwise (or if no user is stored), a new mock session is started for the entered username, and `questionnaireCompleted` defaults to `false`.
    4.  The determined user object is set using `authStore.setUser()`.
    5.  User is redirected to `/dashboard` if `questionnaireCompleted` is true, else to `/questionnaire`.
*   **Session Management:**
    *   The `authStore` uses `localStorage` to persist the `User` object, questionnaire answers, and chat history.
    *   Pages like `/dashboard` and `/questionnaire` check `authStore.getUser()` in a `useEffect` hook to protect routes and redirect if necessary.
    *   Logout clears user data from `localStorage`.

### 4.2. Questionnaire (`/questionnaire`)

1.  Accessible if the user is "logged in" but `questionnaireCompleted` is `false`.
2.  `QuestionnaireForm` displays questions from `src/lib/constants.ts`.
3.  On submit, `handleSubmit` in `questionnaire/page.tsx` calls the `submitQuestionnaire` Server Action.
4.  **`submitQuestionnaire` Server Action (`src/lib/actions.ts`):**
    *   Validates answers.
    *   Formats responses.
    *   Invokes the `analyzeInitialResponses` Genkit flow (`src/ai/flows/mental-state-analysis.ts`).
    *   This flow uses an AI model (Gemini) to analyze the text responses and derive metrics like sentiment, stress, etc.
    *   The analysis result is returned (though not deeply integrated back into storage in the current mock, it demonstrates the capability).
5.  Questionnaire answers are saved to `localStorage` via `authStore.saveQuestionnaire()`.
6.  The user's `questionnaireCompleted` status in `localStorage` is updated to `true`.
7.  User is redirected to `/dashboard`.

### 4.3. Dashboard (`/dashboard`)

This page houses the main interactive elements: Chat and Mental State Visualization.

#### 4.3.1. Chat Interface (`src/components/dashboard/ChatInterface.tsx`)

1.  Loads previous chat history for the current user from `localStorage` via `authStore.getChatHistory()`.
2.  User types a message and submits.
3.  `handleSubmit` function:
    *   Adds the user's message to the local `messages` state.
    *   Retrieves questionnaire responses (stringified) and chat history (stringified) from `authStore`.
    *   Calls the `handleChatInteraction` Server Action (`src/lib/actions.ts`).
4.  **`handleChatInteraction` Server Action:**
    *   Invokes the `personalizedChatInteraction` Genkit flow (`src/ai/flows/personalized-conversational-interaction.ts`).
    *   This flow takes the user's input, questionnaire context, and chat history to generate a contextually relevant AI response using Gemini.
5.  The AI's response is returned to the client.
6.  The AI message is added to the `messages` state.
7.  The updated chat history is saved back to `localStorage` via `authStore.saveChatHistory()`.

#### 4.3.2. Mental State Visualization (`src/components/dashboard/MentalStateVisualization.tsx`)

1.  On component mount (and on refresh click), `fetchData` is called.
2.  `fetchData` function:
    *   Retrieves questionnaire responses (stringified) and chat history (stringified) from `authStore`.
    *   Calls the `generateMentalStateVisualization` Server Action (`src/lib/actions.ts`).
3.  **`generateMentalStateVisualization` Server Action:**
    *   Invokes the `visualizeMentalState` Genkit flow (`src/ai/flows/visualize-mental-state.ts`).
    *   This flow instructs Gemini to analyze the provided text (questionnaire and chat) and output:
        *   Scores (0-10) for predefined metrics: "happy", "sad", "anxiety", "anger", "depressed".
        *   A textual summary of the analysis.
4.  The scores (`barChartData`) and `analysisSummary` are returned to the client.
5.  The `MentalStateVisualization` component uses `recharts` (via ShadCN's Chart components) to render a vertical bar chart of these scores.
    *   Each metric has a dedicated bar and color defined in `chartConfig`.
6.  The `analysisSummary` is displayed below the chart.

## 5. AI Integration with Genkit

*   **Global AI Object (`src/ai/genkit.ts`):** Initializes Genkit with the `googleAI` plugin, specifying the `gemini-2.0-flash` model by default.
*   **Flows (`src/ai/flows/*.ts`):**
    *   Each flow is a server-side TypeScript module marked with `'use server';`.
    *   **Schema Definition:** Input and output schemas are defined using `zod` (`z.object({...})`). This provides type safety and structure for AI prompts.
    *   **Prompt Definition (`ai.definePrompt`):**
        *   Specifies input/output schemas.
        *   Contains the core prompt string, often using Handlebars templating (`{{{variable}}}`) to inject data from the input schema.
        *   The prompt instructs the AI on its role, the task, and the desired output format (often guided by the output schema's field descriptions).
    *   **Flow Definition (`ai.defineFlow`):**
        *   Wraps the prompt.
        *   Takes input/output schemas.
        *   Contains the asynchronous logic to call the defined prompt and return its output.
    *   **Exported Wrapper Function:** An async function is exported from each flow file. This function is what Server Actions call. It simply invokes the defined flow with the input and returns the processed output. This pattern decouples the Server Action from Genkit's internal flow execution mechanism.
*   **Calling Flows:** Server Actions in `src/lib/actions.ts` import and call these exported wrapper functions from the flow files, passing the necessary data.

## 6. Styling and UI

*   **Tailwind CSS:** Used for all styling. Utility classes are applied directly in JSX.
*   **`src/app/globals.css`:**
    *   Imports Tailwind base, components, and utilities.
    *   Defines CSS custom properties (HSL variables) for the application's color theme (background, foreground, primary, accent, destructive, etc.). This allows for easy theming and consistency with ShadCN components.
    *   Includes a dark theme variant.
*   **ShadCN UI Components:** Pre-built components from `src/components/ui/` are used extensively. They are styled with Tailwind and adhere to the theme defined in `globals.css`.
*   **`cn` utility (`src/lib/utils.ts`):** Merges Tailwind classes, useful for conditional class application.

## 7. Low-Level Design Considerations & Patterns

*   **Server Components by Default:** Next.js App Router encourages Server Components, reducing client-side JavaScript. Client Components (`"use client";`) are used only when necessary (e.g., for interactivity, hooks like `useState`, `useEffect`).
*   **Server Actions for Mutations:** Data fetching for display can happen in Server Components, while mutations (login, submit questionnaire, send chat) are handled by Server Actions. This simplifies backend interactions.
*   **Type Safety:** TypeScript is used throughout for better code quality and maintainability. Zod schemas further enhance this for AI flow inputs/outputs and form validation.
*   **Error Handling:**
    *   Forms use `react-hook-form` for client-side validation messages.
    *   Server Actions return success/error states and messages, which are handled by client components (e.g., displaying toasts).
    *   AI flows might encounter errors; these are caught in the Server Actions and reported back.
*   **Responsiveness:** Tailwind CSS's responsive prefixes (`sm:`, `md:`, `lg:`) are used to ensure the layout adapts to different screen sizes.
*   **Accessibility:** ShadCN UI components are built with accessibility in mind (ARIA attributes, keyboard navigation).
*   **Code Organization:**
    *   Separation of concerns (UI components, server logic, AI flows, types).
    *   Consistent naming conventions.
*   **Avoiding Hydration Mismatches:** Browser-specific APIs or dynamic values (like `Math.random()` or `new Date()` for display) that could differ between server and client render are typically handled within `useEffect` hooks to run only client-side after hydration.
*   **`authStore` for Simplicity:** Given this is a prototype/example, `localStorage` is used for simplicity. In a production application, a proper database and server-side session management (e.g., NextAuth.js or a custom solution) would be implemented.

This architectural overview should provide a solid understanding of how the Therapie application is structured and operates.
