import { SettingsRepository } from '../../repositories/user/settingsRepository.js';
import { NotificationSettings, SuggestionSettings, SafetySettings } from '../../models/settingsModels.js';

export class SettingsService {
  constructor(private readonly repository = new SettingsRepository()) {}

  async getNotificationSettings(firebaseUid: string) {
    let settings = await this.repository.getNotificationSettings(firebaseUid);
    if (!settings) {
      settings = {
        firebaseUid,
        messageEnabled: true,
        messageSound: 'Default',
        weatherEnabled: true,
        weatherSound: 'Chime',
        updatedAt: new Date().toISOString(),
      };
      await this.repository.upsertNotificationSettings(firebaseUid, settings);
    }
    return settings;
  }

  async updateNotificationSettings(firebaseUid: string, req: NotificationSettings) {
    const settings: NotificationSettings = { ...req, firebaseUid, updatedAt: new Date().toISOString() };
    await this.repository.upsertNotificationSettings(firebaseUid, settings);
    return settings;
  }

  async getSuggestionSettings(firebaseUid: string) {
    let settings = await this.repository.getSuggestionSettings(firebaseUid);
    if (!settings) {
      settings = {
        firebaseUid,
        suggestionEnabled: true,
        updatedAt: new Date().toISOString(),
      };
      await this.repository.upsertSuggestionSettings(firebaseUid, settings);
    }
    return settings;
  }

  async updateSuggestionSettings(firebaseUid: string, req: SuggestionSettings) {
    const settings: SuggestionSettings = { ...req, firebaseUid, updatedAt: new Date().toISOString() };
    await this.repository.upsertSuggestionSettings(firebaseUid, settings);
    return settings;
  }

  async getSafetySettings(firebaseUid: string) {
    let settings = await this.repository.getSafetySettings(firebaseUid);
    if (!settings) {
      settings = {
        firebaseUid,
        pinEnabled: true,
        biometricEnabled: false,
        fraudAlertsEnabled: true,
        updatedAt: new Date().toISOString(),
      };
      await this.repository.upsertSafetySettings(firebaseUid, settings);
    }
    return settings;
  }

  async updateSafetySettings(firebaseUid: string, req: SafetySettings) {
    const settings: SafetySettings = { ...req, firebaseUid, updatedAt: new Date().toISOString() };
    await this.repository.upsertSafetySettings(firebaseUid, settings);
    return settings;
  }
}
