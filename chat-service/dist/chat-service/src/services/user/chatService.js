import { randomUUID } from 'node:crypto';
import { ChatRepository } from '../../repositories/user/chatRepository.js';
export class ChatService {
    repository;
    constructor(repository = new ChatRepository()) {
        this.repository = repository;
    }
    async getMessages(firebaseUid) {
        return this.repository.getMessagesByUser(firebaseUid);
    }
    async postMessage(input) {
        const message = {
            id: randomUUID(),
            firebaseUid: input.firebaseUid,
            message: input.message,
            isFromUser: true,
            createdAt: new Date().toISOString(),
        };
        return this.repository.addMessage(message);
    }
}
