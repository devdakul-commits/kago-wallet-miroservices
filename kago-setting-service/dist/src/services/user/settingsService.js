import { randomInt } from 'node:crypto';
import { SettingsRepository } from '../../repositories/user/settingsRepository.js';
const referralPrefix = (name) => {
    const normalized = name.trim().toUpperCase();
    return normalized.slice(0, 6) || 'USER';
};
const generateReferralCode = (firstName) => `${referralPrefix(firstName)}${randomInt(1000, 9999)}`;
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
    async getRewardSettings(firebaseUid) {
        let settings = await this.repository.getRewardSettings(firebaseUid);
        if (!settings || !settings.referralCode) {
            const firstName = (await this.repository.getUserFirstName(firebaseUid)) || 'USER';
            const referralCode = generateReferralCode(firstName);
            settings = {
                firebaseUid,
                rewardEnabled: true,
                referralCode,
                updatedAt: new Date().toISOString(),
            };
            await this.repository.upsertRewardSettings(firebaseUid, settings);
        }
        return settings;
    }
    async updateRewardSettings(firebaseUid, req) {
        const firstName = (await this.repository.getUserFirstName(firebaseUid)) || 'USER';
        const referralCode = req.referralCode || generateReferralCode(firstName);
        const settings = {
            ...req,
            firebaseUid,
            referralCode,
            updatedAt: new Date().toISOString(),
        };
        await this.repository.upsertRewardSettings(firebaseUid, settings);
        return settings;
    }
    async getReferralBalance(firebaseUid) {
        return this.repository.getReferralBalance(firebaseUid);
    }
    async redeemReferralBalance(firebaseUid) {
        const balance = await this.repository.getReferralBalance(firebaseUid);
        if (balance === 0) {
            return { status: 'no_balance', message: 'No referral balance to redeem' };
        }
        await this.repository.redeemReferralBalance(firebaseUid);
        return { status: 'success', message: `Redeemed ₦${balance} to wallet` };
    }
    async getReferralHistory(firebaseUid) {
        return this.repository.getReferralHistory(firebaseUid);
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
