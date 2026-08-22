import { query } from '../../../../shared/db/index.js';
export class ChatRepository {
    async getMessagesByUser(firebaseUid) {
        const result = await query(`SELECT id, firebase_uid, message, is_from_user, created_at FROM support_chat WHERE firebase_uid = $1 ORDER BY created_at ASC`, [firebaseUid]);
        return result.rows.map((row) => ({
            id: String(row.id),
            firebaseUid: row.firebase_uid,
            message: row.message,
            isFromUser: Boolean(row.is_from_user),
            createdAt: row.created_at.toISOString(),
        }));
    }
    async addMessage(message) {
        const result = await query(`INSERT INTO support_chat (firebase_uid, message, is_from_user, created_at)
       VALUES ($1, $2, $3, $4)
       RETURNING id`, [message.firebaseUid, message.message, message.isFromUser, message.createdAt]);
        return {
            ...message,
            id: String(result.rows[0].id),
        };
    }
}
