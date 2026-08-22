import { query } from '../../../shared/db/index.js';
export class SettingsRepository {
    async getNotificationSettings(firebaseUid) {
        const result = await query(`SELECT firebase_uid, message_enabled, message_sound, weather_enabled, weather_sound, updated_at
         FROM notification_settings WHERE firebase_uid=$1`, [firebaseUid]);
        return result.rows[0];
    }
    async upsertNotificationSettings(firebaseUid, settings) {
        await query(`INSERT INTO notification_settings (firebase_uid, message_enabled, message_sound, weather_enabled, weather_sound, updated_at)
         VALUES ($1,$2,$3,$4,$5,$6)
         ON CONFLICT (firebase_uid) DO UPDATE SET
           message_enabled=$2, message_sound=$3,
           weather_enabled=$4, weather_sound=$5,
           updated_at=$6`, [firebaseUid, settings.messageEnabled, settings.messageSound, settings.weatherEnabled, settings.weatherSound, settings.updatedAt]);
    }
    async getRewardSettings(firebaseUid) {
        const result = await query(`SELECT firebase_uid, reward_enabled, referral_code, updated_at
         FROM reward_settings WHERE firebase_uid=$1`, [firebaseUid]);
        return result.rows[0];
    }
    async upsertRewardSettings(firebaseUid, settings) {
        await query(`INSERT INTO reward_settings (firebase_uid, reward_enabled, referral_code, updated_at)
         VALUES ($1,$2,$3,$4)
         ON CONFLICT (firebase_uid) DO UPDATE SET
           reward_enabled=$2, referral_code=$3, updated_at=$4`, [firebaseUid, settings.rewardEnabled, settings.referralCode, settings.updatedAt]);
    }
    async getReferralBalance(firebaseUid) {
        const result = await query(`SELECT COALESCE(SUM(bonus),0) as balance FROM referrals WHERE firebase_uid=$1 AND redeemed=false`, [firebaseUid]);
        return Number(result.rows[0]?.balance ?? 0);
    }
    async redeemReferralBalance(firebaseUid) {
        await query(`UPDATE wallet SET reward_balance = COALESCE(reward_balance, 0) + (
         SELECT COALESCE(SUM(bonus),0) FROM referrals WHERE firebase_uid=$1 AND redeemed=false
       ) WHERE firebase_uid=$1`, [firebaseUid]);
        await query(`UPDATE referrals SET redeemed=true WHERE firebase_uid=$1`, [firebaseUid]);
    }
    async getReferralHistory(firebaseUid) {
        const result = await query(`SELECT friend_name as friend, joined_at, bonus, redeemed
         FROM referrals WHERE firebase_uid=$1 ORDER BY joined_at DESC`, [firebaseUid]);
        return result.rows.map((row) => ({
            friend: String(row.friend),
            date: row.joined_at?.toISOString?.() ?? String(row.joined_at),
            bonus: Number(row.bonus),
            redeemed: Boolean(row.redeemed),
        }));
    }
    async getSuggestionSettings(firebaseUid) {
        const result = await query(`SELECT firebase_uid, suggestion_enabled, updated_at
         FROM suggestion_settings WHERE firebase_uid=$1`, [firebaseUid]);
        return result.rows[0];
    }
    async upsertSuggestionSettings(firebaseUid, settings) {
        await query(`INSERT INTO suggestion_settings (firebase_uid, suggestion_enabled, updated_at)
         VALUES ($1,$2,$3)
         ON CONFLICT (firebase_uid) DO UPDATE SET
           suggestion_enabled=$2, updated_at=$3`, [firebaseUid, settings.suggestionEnabled, settings.updatedAt]);
    }
    async getSafetySettings(firebaseUid) {
        const result = await query(`SELECT firebase_uid, pin_enabled, biometric_enabled, fraud_alerts_enabled, updated_at
         FROM safety_settings WHERE firebase_uid=$1`, [firebaseUid]);
        return result.rows[0];
    }
    async upsertSafetySettings(firebaseUid, settings) {
        await query(`INSERT INTO safety_settings (firebase_uid, pin_enabled, biometric_enabled, fraud_alerts_enabled, updated_at)
         VALUES ($1,$2,$3,$4,$5)
         ON CONFLICT (firebase_uid) DO UPDATE SET
           pin_enabled=$2, biometric_enabled=$3, fraud_alerts_enabled=$4, updated_at=$5`, [firebaseUid, settings.pinEnabled, settings.biometricEnabled, settings.fraudAlertsEnabled, settings.updatedAt]);
    }
    async getUserFirstName(firebaseUid) {
        const result = await query(`SELECT first_name FROM users WHERE firebase_uid=$1`, [firebaseUid]);
        return result.rows[0]?.first_name;
    }
}
