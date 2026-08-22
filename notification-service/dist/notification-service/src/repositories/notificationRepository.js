const notifications = new Map();
export class NotificationRepository {
    list(userId) {
        return notifications.get(userId) ?? [];
    }
    create(userId, message, channel) {
        const record = { id: `${Date.now()}`, userId, message, channel, createdAt: new Date().toISOString() };
        const items = notifications.get(userId) ?? [];
        items.push(record);
        notifications.set(userId, items);
        return record;
    }
}
