import { query } from '../../../../shared/db/index.js';
import { NotificationSettings, SuggestionSettings, SafetySettings } from '../../models/settingsModels.js';

export class SettingsRepository {
  async getNotificationSettings(firebaseUid: string) {
    const result = await query(
      `SELECT firebase_uid, message_enabled, message_sound, weather_enabled, weather_sound, updated_at
         FROM notification_settings WHERE firebase_uid=$1`,
      [firebaseUid]
    );

    return result.rows[0] as NotificationSettings | undefined;
  }

  async upsertNotificationSettings(firebaseUid: string, settings: NotificationSettings) {
    await query(
      `INSERT INTO notification_settings (firebase_uid, message_enabled, message_sound, weather_enabled, weather_sound, updated_at)
         VALUES ($1,$2,$3,$4,$5,$6)
         ON CONFLICT (firebase_uid) DO UPDATE SET
           message_enabled=$2, message_sound=$3,
           weather_enabled=$4, weather_sound=$5,
           updated_at=$6`,
      [firebaseUid, settings.messageEnabled, settings.messageSound, settings.weatherEnabled, settings.weatherSound, settings.updatedAt]
    );
  }


  async getSuggestionSettings(firebaseUid: string) {
    const result = await query(
      `SELECT firebase_uid, suggestion_enabled, updated_at
         FROM suggestion_settings WHERE firebase_uid=$1`,
      [firebaseUid]
    );
    return result.rows[0] as SuggestionSettings | undefined;
  }

  async upsertSuggestionSettings(firebaseUid: string, settings: SuggestionSettings) {
    await query(
      `INSERT INTO suggestion_settings (firebase_uid, suggestion_enabled, updated_at)
         VALUES ($1,$2,$3)
         ON CONFLICT (firebase_uid) DO UPDATE SET
           suggestion_enabled=$2, updated_at=$3`,
      [firebaseUid, settings.suggestionEnabled, settings.updatedAt]
    );
  }

  async getSafetySettings(firebaseUid: string) {
    const result = await query(
      `SELECT firebase_uid, pin_enabled, biometric_enabled, fraud_alerts_enabled, updated_at
         FROM safety_settings WHERE firebase_uid=$1`,
      [firebaseUid]
    );
    return result.rows[0] as SafetySettings | undefined;
  }

  async upsertSafetySettings(firebaseUid: string, settings: SafetySettings) {
    await query(
      `INSERT INTO safety_settings (firebase_uid, pin_enabled, biometric_enabled, fraud_alerts_enabled, updated_at)
         VALUES ($1,$2,$3,$4,$5)
         ON CONFLICT (firebase_uid) DO UPDATE SET
           pin_enabled=$2, biometric_enabled=$3, fraud_alerts_enabled=$4, updated_at=$5`,
      [firebaseUid, settings.pinEnabled, settings.biometricEnabled, settings.fraudAlertsEnabled, settings.updatedAt]
    );
  }

}
