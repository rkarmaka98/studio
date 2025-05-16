
import type { User, QuestionnaireAnswers, ChatMessage } from '@/types';

const USER_KEY = 'Therapie-user';
const QUESTIONNAIRE_KEY_PREFIX = 'Therapie-questionnaire-';
const CHAT_HISTORY_KEY_PREFIX = 'Therapie-chat-';

export const authStore = {
  setUser: (user: User) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    }
  },
  getUser: (): User | null => {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem(USER_KEY);
      return userStr ? JSON.parse(userStr) : null;
    }
    return null;
  },
  clearUser: () => {
    if (typeof window !== 'undefined') {
      const user = authStore.getUser();
      if (user) {
        localStorage.removeItem(QUESTIONNAIRE_KEY_PREFIX + user.id);
        localStorage.removeItem(CHAT_HISTORY_KEY_PREFIX + user.id);
      }
      localStorage.removeItem(USER_KEY);
    }
  },
  saveQuestionnaire: (userId: string, answers: QuestionnaireAnswers) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(QUESTIONNAIRE_KEY_PREFIX + userId, JSON.stringify(answers));
      const user = authStore.getUser();
      if (user && user.id === userId) {
        authStore.setUser({ ...user, questionnaireCompleted: true });
      }
    }
  },
  getQuestionnaire: (userId: string): QuestionnaireAnswers | null => {
    if (typeof window !== 'undefined') {
      const data = localStorage.getItem(QUESTIONNAIRE_KEY_PREFIX + userId);
      return data ? JSON.parse(data) : null;
    }
    return null;
  },
  getQuestionnaireString: (userId: string): string => {
    if (typeof window !== 'undefined') {
      const data = localStorage.getItem(QUESTIONNAIRE_KEY_PREFIX + userId);
      if (!data) return "No questionnaire data found.";
      const answers: QuestionnaireAnswers = JSON.parse(data);
      return Object.entries(answers)
        .map(([key, value]) => `${key.replace('question', 'Q')}: ${value}`)
        .join('\n');
    }
    return "No questionnaire data found.";
  },
  saveChatHistory: (userId: string, messages: ChatMessage[]) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(CHAT_HISTORY_KEY_PREFIX + userId, JSON.stringify(messages));
    }
  },
  getChatHistory: (userId: string): ChatMessage[] => {
    if (typeof window !== 'undefined') {
      const data = localStorage.getItem(CHAT_HISTORY_KEY_PREFIX + userId);
      return data ? JSON.parse(data) : [];
    }
    return [];
  },
  getChatHistoryString: (userId: string): string => {
    if (typeof window !== 'undefined') {
      const messages = authStore.getChatHistory(userId);
      if (!messages.length) return "No chat history.";
      return messages.map(msg => `${msg.sender}: ${msg.text}`).join('\n');
    }
    return "No chat history.";
  },
};
