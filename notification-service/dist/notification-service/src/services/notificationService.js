import { NotificationRepository } from '../repositories/notificationRepository.js';
import { eventBus, EVENT_TYPES } from '../../../shared/events/eventBus.js';
export class NotificationService {
    repository;
    constructor(repository = new NotificationRepository()) {
        this.repository = repository;
    }
    send(userId, message, channel) {
        const record = this.repository.create(userId, message, channel);
        eventBus.publish(EVENT_TYPES.NOTIFICATION_SENT, { userId, message, channel });
        return { success: true, notification: record };
    }
    list(userId) {
        return this.repository.list(userId);
    }
}
