import { randomInt } from 'node:crypto';
import { RewardSettingsRepository } from '../../repositories/user/rewardSettingsRepository.js';
import { RewardSettings, ReferralHistoryItem } from '../../models/rewardModels.js';

const referralPrefix = (name: string) => {
  const normalized = name.trim().toUpperCase();
  return normalized.slice(0, 6) || 'USER';
};

const generateReferralCode = (firstName: string) => `${referralPrefix(firstName)}${randomInt(1000, 9999)}`;

export class RewardSettingsService {
  constructor(private readonly repository = new RewardSettingsRepository()) {}

  async getRewardSettings(firebaseUid: string) {
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

  async updateRewardSettings(firebaseUid: string, req: RewardSettings) {
    const firstName = (await this.repository.getUserFirstName(firebaseUid)) || 'USER';
    const referralCode = req.referralCode || generateReferralCode(firstName);
    const settings: RewardSettings = {
      ...req,
      firebaseUid,
      referralCode,
      updatedAt: new Date().toISOString(),
    };
    await this.repository.upsertRewardSettings(firebaseUid, settings);
    return settings;
  }

  async getReferralBalance(firebaseUid: string) {
    return this.repository.getReferralBalance(firebaseUid);
  }

  async redeemReferralBalance(firebaseUid: string) {
    const balance = await this.repository.getReferralBalance(firebaseUid);
    if (balance === 0) {
      return { status: 'no_balance', message: 'No referral balance to redeem' };
    }
    await this.repository.redeemReferralBalance(firebaseUid);
    return { status: 'success', message: `Redeemed ₦${balance} to wallet` };
  }

  async getReferralHistory(firebaseUid: string) {
    return this.repository.getReferralHistory(firebaseUid);
  }
}
