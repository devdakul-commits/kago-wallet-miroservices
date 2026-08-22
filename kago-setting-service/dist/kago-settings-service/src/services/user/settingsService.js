import { SettingsRepository } from '../../repositories/user/settingsRepository.js';
export class SettingsService {
    repository;
    constructor(repository = new SettingsRepository()) {
        this.repository = repository;
    }
    async getNotificationSettings(firebaseUid) {
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
    async updateNotificationSettings(firebaseUid, req) {
        const settings = { ...req, firebaseUid, updatedAt: new Date().toISOString() };
        await this.repository.upsertNotificationSettings(firebaseUid, settings);
        return settings;
    }
    async getSuggestionSettings(firebaseUid) {
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
    async updateSuggestionSettings(firebaseUid, req) {
        const settings = { ...req, firebaseUid, updatedAt: new Date().toISOString() };
        await this.repository.upsertSuggestionSettings(firebaseUid, settings);
        return settings;
    }
    async getSafetySettings(firebaseUid) {
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
    async updateSafetySettings(firebaseUid, req) {
        const settings = { ...req, firebaseUid, updatedAt: new Date().toISOString() };
        await this.repository.upsertSafetySettings(firebaseUid, settings);
        return settings;
    }
}
