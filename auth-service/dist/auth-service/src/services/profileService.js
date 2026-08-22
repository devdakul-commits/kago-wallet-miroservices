import { ProfileRepository } from '../repositories/profileRepository.js';
import { eventBus, EVENT_TYPES } from '../../../shared/events/eventBus.js';
export class ProfileService {
    repository;
    constructor(repository = new ProfileRepository()) {
        this.repository = repository;
    }
    async login(userId, email) {
        const token = `mock-token-${userId}`;
        const profile = await this.repository.upsert(userId, { display_name: 'Kago User', email });
        eventBus.publish(EVENT_TYPES.AUTH_LOGIN, { userId, email, token });
        return {
            success: true,
            userId,
            email,
            token,
            profile,
        };
    }
    async getProfile(firebaseUid) {
        return (await this.repository.getByFirebaseUid(firebaseUid)) ?? (await this.repository.upsert(firebaseUid, { display_name: 'Kago User', email: 'user@example.com' }));
    }
    async setProfileField(firebaseUid, field, value) {
        // map friendly field names to DB columns
        const allowed = ['photo_url', 'cac_document', 'valid_id', 'business_image'];
        if (!allowed.includes(field))
            throw new Error('Field not allowed');
        return this.repository.updateField(firebaseUid, field, value);
    }
    async updateProfile(firebaseUid, data) {
        return this.repository.upsert(firebaseUid, { display_name: String(data.fullName ?? data.display_name ?? 'Kago User'), email: String(data.email ?? 'user@example.com') });
    }
    async updateNotificationSettings(firebaseUid, payload) {
        const profile = await this.getProfile(firebaseUid);
        profile.notificationSettings = { ...(profile.notificationSettings ?? { email: true, sms: false }), ...payload };
        return profile;
    }
    async updateRewardSettings(firebaseUid, payload) {
        const profile = await this.getProfile(firebaseUid);
        profile.rewardSettings = { ...(profile.rewardSettings ?? { enabled: true }), ...payload };
        return profile;
    }
    async updateSafetySettings(firebaseUid, payload) {
        const profile = await this.getProfile(firebaseUid);
        profile.safetySettings = { ...(profile.safetySettings ?? { emergencyContact: true }), ...payload };
        return profile;
    }
    async getSuggestions(firebaseUid) {
        const profile = await this.getProfile(firebaseUid);
        return { firebaseUid, suggestions: profile.suggestions ?? [] };
    }
    async addSuggestion(firebaseUid, suggestion) {
        return this.repository.addSuggestion(firebaseUid, suggestion);
    }
    async getSupportMessages(firebaseUid) {
        const profile = await this.getProfile(firebaseUid);
        return { firebaseUid, messages: profile.supportMessages ?? [] };
    }
    async addSupportMessage(firebaseUid, message) {
        return this.repository.addSupportMessage(firebaseUid, message);
    }
    async getRewardStatus(firebaseUid) {
        const profile = await this.getProfile(firebaseUid);
        const history = profile.rewardHistory ?? [];
        return { firebaseUid, checkedIn: history.length > 0, streak: history.length };
    }
    async checkIn(firebaseUid) {
        const profile = this.repository.checkIn(firebaseUid);
        return { firebaseUid, rewardHistory: profile.rewardHistory ?? [] };
    }
    getWeather() {
        return { condition: 'Clear', temperature: 28, humidity: 60 };
    }
}
