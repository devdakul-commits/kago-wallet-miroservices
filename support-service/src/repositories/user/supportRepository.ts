import { query } from '../../../shared/db/index.js';
import { ChatMessage, Report, Suggestion } from '../../models/supportModels.js';

export class SupportRepository {
  async getMessagesByUser(firebaseUid: string) {
    const result = await query(
      `SELECT id, firebase_uid, message, is_from_user, created_at
       FROM support_chat WHERE firebase_uid=$1 ORDER BY created_at ASC`,
      [firebaseUid]
    );

    return result.rows.map((row: any) => ({
      id: String(row.id),
      firebaseUid: row.firebase_uid,
      message: row.message,
      isFromUser: Boolean(row.is_from_user),
      createdAt: row.created_at.toISOString(),
    })) as ChatMessage[];
  }

  async addMessage(message: ChatMessage) {
    const result = await query(
      `INSERT INTO support_chat (firebase_uid, message, is_from_user, created_at)
       VALUES ($1, $2, $3, $4) RETURNING id`,
      [message.firebaseUid, message.message, message.isFromUser, message.createdAt]
    );

    return {
      ...message,
      id: String(result.rows[0].id),
    };
  }

  async addReport(report: Report) {
    const result = await query(
      `INSERT INTO reports (id, firebase_uid, issue, description, status, created_at, resolved_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
      [report.id, report.firebaseUid, report.issue, report.description, report.status, report.createdAt, report.resolvedAt]
    );

    return {
      ...report,
      id: String(result.rows[0].id),
    };
  }

  async getReportsByUser(firebaseUid: string) {
    const result = await query(
      `SELECT id, firebase_uid, issue, description, status, created_at, resolved_at
       FROM reports WHERE firebase_uid=$1 ORDER BY created_at DESC`,
      [firebaseUid]
    );

    return result.rows.map((row: any) => ({
      id: String(row.id),
      firebaseUid: row.firebase_uid,
      issue: row.issue,
      description: row.description,
      status: row.status,
      createdAt: row.created_at.toISOString(),
      resolvedAt: row.resolved_at ? row.resolved_at.toISOString() : null,
    })) as Report[];
  }

  async getSuggestionsByUser(firebaseUid: string) {
    const result = await query(
      `SELECT id, firebase_uid, title, description, created_at
       FROM suggestions WHERE firebase_uid=$1 ORDER BY created_at DESC`,
      [firebaseUid]
    );

    return result.rows.map((row: any) => ({
      id: String(row.id),
      firebaseUid: row.firebase_uid,
      title: row.title,
      description: row.description,
      createdAt: row.created_at.toISOString(),
    })) as Suggestion[];
  }

  async addSuggestion(suggestion: Suggestion) {
    const result = await query(
      `INSERT INTO suggestions (id, firebase_uid, title, description, created_at)
       VALUES ($1, $2, $3, $4, $5) RETURNING id`,
      [suggestion.id, suggestion.firebaseUid, suggestion.title, suggestion.description, suggestion.createdAt]
    );

    return {
      ...suggestion,
      id: String(result.rows[0].id),
    };
  }
}
