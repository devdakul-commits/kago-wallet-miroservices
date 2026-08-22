interface NotificationRecord {
  id: string;
  userId: string;
  message: string;
  channel: string;
  createdAt: string;
}

const notifications = new Map<string, NotificationRecord[]>();

export class NotificationRepository {
  list(userId: string) {
    return notifications.get(userId) ?? [];
  }

  create(userId: string, message: string, channel: string) {
    const record = { id: `${Date.now()}`, userId, message, channel, createdAt: new Date().toISOString() };
    const items = notifications.get(userId) ?? [];
    items.push(record);
    notifications.set(userId, items);
    return record;
  }
}
