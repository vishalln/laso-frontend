import { apiClient } from "@/lib/apiClient";

const BASE = import.meta.env.VITE_API_URL as string;

export interface QuizSubmissionResult {
  quiz_id: string;
  patient_id: string | null;
  bmi: number | null;
  eligible: boolean;
  created_at: string | null;
  age: number | null;
  height_cm: number | null;
  weight_kg: number | null;
  conditions: string[];
  primary_goal: string | null;
}

export const quizService = {
  submit: (answers: Record<string, unknown>) =>
    apiClient.post<QuizSubmissionResult>("/quiz/submit", answers),

  submitAnonymous: async (answers: Record<string, unknown>): Promise<QuizSubmissionResult> => {
    const res = await fetch(`${BASE}/quiz/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(answers),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json?.error?.message ?? `HTTP ${res.status}`);
    return (json.data !== undefined ? json.data : json) as QuizSubmissionResult;
  },

  claim: (quizId: string) =>
    apiClient.post<QuizSubmissionResult>(`/quiz/claim/${quizId}`, {}),

  getMyLatest: () =>
    apiClient.get<QuizSubmissionResult>("/quiz/result"),

  getPatientQuiz: (patientId: string) =>
    apiClient.get<QuizSubmissionResult>(`/quiz/patient/${patientId}`),
};
