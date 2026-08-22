export interface NotificationSettings {
  firebaseUid: string;
  messageEnabled: boolean;
  messageSound: string;
  weatherEnabled: boolean;
  weatherSound: string;
  updatedAt: string;
}

export interface SuggestionSettings {
  firebaseUid: string;
  suggestionEnabled: boolean;
  updatedAt: string;
}

export interface SafetySettings {
  firebaseUid: string;
  pinEnabled: boolean;
  biometricEnabled: boolean;
  fraudAlertsEnabled: boolean;
  updatedAt: string;
}
