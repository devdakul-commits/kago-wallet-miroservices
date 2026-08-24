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

export interface CreateReportInput {
  firebaseUid: string;
  issue: string;
  description: string;
}

export interface WeatherResponse {
  condition: string;
  temperature: number;
  humidity: number;
  timeOfDay: string;
  location: string;
}

export interface Suggestion {
  id: string;
  firebaseUid: string;
  title: string;
  description: string;
  createdAt: string;
}

export interface CreateSuggestionInput {
  firebaseUid: string;
  title: string;
  description: string;
}

export interface Report {
  id: string;
  firebaseUid: string;
  issue: string;
  description: string;
  status: string;
  createdAt: string;
  resolvedAt: string | null;
}
