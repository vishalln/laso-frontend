export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender_role: string;
  content: string;
  sent_at: string;
  read_at?: string;
}

export interface Conversation {
  id: string;
  patient_id: string;
  participants: { id: string; name: string; role: string }[];
  last_message?: Message;
  unread_count: number;
  updated_at: string;
}
