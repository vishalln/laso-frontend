import { apiClient } from "@/lib/apiClient";
import type { Message, Conversation } from "@/types/message";

export const messageService = {
  send: (patientId: string, text: string) =>
    apiClient.post<Message>("/messages", { patient_id: patientId, text }),
  getMessages: (conversationId: string) => apiClient.get<Message[]>(`/messages/${conversationId}`),
  getConversationForPatient: (patientId: string) => apiClient.get<Conversation>(`/messages/conversation/${patientId}`),
  recentSent: () => apiClient.get<Message[]>("/messages/recent-sent"),
};
