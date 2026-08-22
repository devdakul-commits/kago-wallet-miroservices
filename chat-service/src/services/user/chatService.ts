import { randomUUID } from 'node:crypto';
import { ChatMessage, CreateChatMessageInput } from '../../models/chatModels.js';
import { ChatRepository } from '../../repositories/user/chatRepository.js';

export class ChatService {
  constructor(private readonly repository = new ChatRepository()) {}

  async getMessages(firebaseUid: string) {
    return this.repository.getMessagesByUser(firebaseUid);
  }

  async postMessage(input: CreateChatMessageInput) {
    const message: ChatMessage = {
      id: randomUUID(),
      firebaseUid: input.firebaseUid,
      message: input.message,
      isFromUser: true,
      createdAt: new Date().toISOString(),
    };

    return this.repository.addMessage(message);
  }
}
