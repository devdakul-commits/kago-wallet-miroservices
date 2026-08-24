import { randomInt } from 'node:crypto';
import { RewardSettingsRepository } from '../../repositories/user/rewardSettingsRepository.js';
const referralPrefix = (name) => {
    const normalized = name.trim().toUpperCase();
    return normalized.slice(0, 6) || 'USER';
};
const generateReferralCode = (firstName) => `${referralPrefix(firstName)}${randomInt(1000, 9999)}`;
export class RewardSettingsService {
    repository;
    constructor(repository = new RewardSettingsRepository()) {
        this.repository = repository;
    }
    async getRewardSettings(firebaseUid) {
        let settings = await this.repository.getRewardSettings(firebaseUid);
        if (!settings || !settings.referralCode) {
            const firstName = (await this.repository.getUserFirstName(firebaseUid)) || 'USER';
            settings = {
                firebaseUid,
                rewardEnabled: true,
                referralCode: generateReferralCode(firstName),
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
}
