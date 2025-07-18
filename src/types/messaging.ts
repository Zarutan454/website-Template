export interface Conversation {
  id: number;
  conversation_type: 'direct' | 'group';
  name?: string;
  created_at: string;
  updated_at: string;
  unread_count: number;
  last_message?: {
    content: string;
    message_type: string;
    created_at: string;
    sender_username: string;
  };
  participant_id?: number;
  participant_username?: string;
  participant_display_name?: string;
  participant_avatar_url?: string;
}

export interface Message {
  id: number;
  content: string;
  message_type: 'text' | 'image' | 'video' | 'audio' | 'file';
  media_url?: string;
  attachment_name?: string;
  attachment_size?: number;
  attachment_type?: string;
  is_read: boolean;
  created_at: string;
  sender: {
    id: number;
    username: string;
    display_name: string;
    avatar_url?: string;
  };
  reactions: Array<{
    reaction_type: string;
    count: number;
  }>;
  is_own_message: boolean;
}

export interface ConversationResponse {
  conversations: Conversation[];
  total: number;
}

export interface MessagesResponse {
  messages: Message[];
  conversation: {
    id: number;
    conversation_type: string;
    name?: string;
  };
}

export interface CreateConversationRequest {
  conversation_type: 'direct' | 'group';
  participant_ids: number[];
  name?: string;
}

export interface SendMessageRequest {
  content?: string;
  message_type?: 'text' | 'image' | 'video' | 'audio' | 'file';
  media_url?: string;
  attachment_name?: string;
  attachment_size?: number;
  attachment_type?: string;
}

export interface MessageReactionRequest {
  reaction_type: string;
}

export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  message?: string;
} 