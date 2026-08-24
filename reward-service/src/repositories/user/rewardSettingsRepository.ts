import { query } from '../../../../shared/db/index.js';
import { RewardSettings, ReferralHistoryItem } from '../../models/rewardModels.js';

export class RewardSettingsRepository {
  async getRewardSettings(firebaseUid: string) {
    const result = await query(
      `SELECT firebase_uid, reward_enabled, referral_code, updated_at
         FROM reward_settings WHERE firebase_uid=$1`,
      [firebaseUid]
    );
    return result.rows[0] as RewardSettings | undefined;
  }

  async upsertRewardSettings(firebaseUid: string, settings: RewardSettings) {
    await query(
      `INSERT INTO reward_settings (firebase_uid, reward_enabled, referral_code, updated_at)
         VALUES ($1,$2,$3,$4)
         ON CONFLICT (firebase_uid) DO UPDATE SET
           reward_enabled=$2, referral_code=$3, updated_at=$4`,
      [firebaseUid, settings.rewardEnabled, settings.referralCode, settings.updatedAt]
    );
  }

  async getReferralBalance(firebaseUid: string) {
    const result = await query(
      `SELECT COALESCE(SUM(bonus),0) AS balance FROM referrals WHERE firebase_uid=$1 AND redeemed=false`,
      [firebaseUid]
    );
    return Number(result.rows[0]?.balance ?? 0);
  }

  async redeemReferralBalance(firebaseUid: string) {
    await query(
      `UPDATE wallet SET reward_balance = COALESCE(reward_balance, 0) + (
         SELECT COALESCE(SUM(bonus),0) FROM referrals WHERE firebase_uid=$1 AND redeemed=false
       ) WHERE firebase_uid=$1`,
      [firebaseUid]
    );

    await query(
      `UPDATE referrals SET redeemed=true WHERE firebase_uid=$1`,
      [firebaseUid]
    );
  }

  async getReferralHistory(firebaseUid: string) {
    const result = await query(
      `SELECT friend_name AS friend, joined_at, bonus, redeemed
         FROM referrals WHERE firebase_uid=$1 ORDER BY joined_at DESC`,
      [firebaseUid]
    );

    return result.rows.map((row: any) => ({
      friend: String(row.friend),
      date: row.joined_at?.toISOString?.() ?? String(row.joined_at),
      bonus: Number(row.bonus),
      redeemed: Boolean(row.redeemed),
    })) as ReferralHistoryItem[];
  }

  async getUserFirstName(firebaseUid: string) {
    const result = await query(`SELECT first_name FROM users WHERE firebase_uid=$1`, [firebaseUid]);
    return result.rows[0]?.first_name as string | undefined;
  }
}
