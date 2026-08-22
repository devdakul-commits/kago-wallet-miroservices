export interface ChatMessage {
  id: string;
  firebaseUid: string;
  message: string;
  isFromUser: boolean;
  createdAt: string;
}

export interface CreateChatMessageInput {
  firebaseUid: string;
  message: string;
}

export interface CreateVendorChatMessageInput {
  firebaseUid: string;
  message: string;
}

export interface ChatMessagePayload {
  firebaseUid: string;
  message: string;
}
