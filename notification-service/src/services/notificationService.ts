import { NotificationRepository } from '../repositories/notificationRepository.js';
import { eventBus, EVENT_TYPES } from '../../shared/events/eventBus.js';

export class NotificationService {
  constructor(private readonly repository = new NotificationRepository()) {}

  send(userId: string, message: string, channel: string) {
    const record = this.repository.create(userId, message, channel);
    eventBus.publish(EVENT_TYPES.NOTIFICATION_SENT, { userId, message, channel });
    return { success: true, notification: record };
  }

  list(userId: string) {
    return this.repository.list(userId);
  }
}
