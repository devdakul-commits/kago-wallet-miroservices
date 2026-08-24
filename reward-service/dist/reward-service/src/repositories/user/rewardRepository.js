import { query } from '../../../../shared/db/index.js';
export class RewardRepository {
    async getCheckins(firebaseUid, month, year) {
        const result = await query(`SELECT day FROM daily_checkins WHERE firebase_uid=$1 AND month=$2 AND year=$3 ORDER BY day ASC`, [firebaseUid, month, year]);
        return result.rows.map((row) => Number(row.day));
    }
    async addCheckin(firebaseUid, day, month, year) {
        await query(`INSERT INTO daily_checkins (firebase_uid, day, month, year, created_at) VALUES ($1,$2,$3,$4,NOW())`, [firebaseUid, day, month, year]);
    }
    async creditReward(firebaseUid, amount) {
        await query(`UPDATE wallet SET reward_balance = COALESCE(reward_balance, 0) + $1 WHERE firebase_uid=$2`, [amount, firebaseUid]);
    }
    async getDailyHistory(firebaseUid) {
        const result = await query(`SELECT day, month, year, created_at FROM daily_checkins WHERE firebase_uid=$1 ORDER BY year DESC, month DESC, day DESC`, [firebaseUid]);
        return result.rows.map((row) => ({
            day: Number(row.day),
            month: Number(row.month),
            year: Number(row.year),
            createdAt: row.created_at?.toISOString?.() ?? String(row.created_at),
        }));
    }
}
