import { ProfileRepository } from '../repositories/profileRepository.js';
import { eventBus, EVENT_TYPES } from '../../shared/events/eventBus.js';

export class ProfileService {
  constructor(private readonly repository = new ProfileRepository()) {}

  async login(userId: string, email: string) {
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

  async getProfile(firebaseUid: string) {
    return (await this.repository.getByFirebaseUid(firebaseUid)) ?? (await this.repository.upsert(firebaseUid, { display_name: 'Kago User', email: 'user@example.com' } as any));
  }

  async setProfileField(firebaseUid: string, field: string, value: string) {
    // map friendly field names to DB columns
    const allowed = ['photo_url', 'cac_document', 'valid_id', 'business_image'];
    if (!allowed.includes(field)) throw new Error('Field not allowed');
    return this.repository.updateField(firebaseUid, field, value);
  }
  async updateProfile(firebaseUid: string, data: Record<string, unknown>) {
    return this.repository.upsert(firebaseUid, { display_name: String(data.fullName ?? data.display_name ?? 'Kago User'), email: String(data.email ?? 'user@example.com') } as any);
  }

  async updateNotificationSettings(firebaseUid: string, payload: { email?: boolean; sms?: boolean }) {
    const profile = await this.getProfile(firebaseUid);
    (profile as any).notificationSettings = { ...((profile as any).notificationSettings ?? { email: true, sms: false }), ...payload };
    return profile;
  }

  async updateRewardSettings(firebaseUid: string, payload: { enabled?: boolean }) {
    const profile = await this.getProfile(firebaseUid);
    (profile as any).rewardSettings = { ...((profile as any).rewardSettings ?? { enabled: true }), ...payload };
    return profile;
  }

  async updateSafetySettings(firebaseUid: string, payload: { emergencyContact?: boolean }) {
    const profile = await this.getProfile(firebaseUid);
    (profile as any).safetySettings = { ...((profile as any).safetySettings ?? { emergencyContact: true }), ...payload };
    return profile;
  }

  async getSuggestions(firebaseUid: string) {
    const profile = await this.getProfile(firebaseUid);
    return { firebaseUid, suggestions: (profile as any).suggestions ?? [] };
  }

  async addSuggestion(firebaseUid: string, suggestion: string) {
    return this.repository.addSuggestion(firebaseUid, suggestion);
  }

  async getSupportMessages(firebaseUid: string) {
    const profile = await this.getProfile(firebaseUid);
    return { firebaseUid, messages: (profile as any).supportMessages ?? [] };
  }

  async addSupportMessage(firebaseUid: string, message: string) {
    return this.repository.addSupportMessage(firebaseUid, message);
  }

  async getRewardStatus(firebaseUid: string) {
    const profile = await this.getProfile(firebaseUid);
    const history = (profile as any).rewardHistory ?? [];
    return { firebaseUid, checkedIn: history.length > 0, streak: history.length };
  }

  async checkIn(firebaseUid: string) {
    const profile = this.repository.checkIn(firebaseUid);
    return { firebaseUid, rewardHistory: (profile as any).rewardHistory ?? [] };
  }

  getWeather() {
    return { condition: 'Clear', temperature: 28, humidity: 60 };
  }
}
