import { randomUUID } from 'node:crypto';
import { ChatMessage, CreateVendorChatMessageInput } from '../../models/chatModels.js';
import { VendorChatRepository } from '../../repositories/vendor/chatRepository.js';

export class VendorChatService {
  constructor(private readonly repository = new VendorChatRepository()) {}

  async getMessages(firebaseUid: string) {
    return this.repository.getMessagesByUser(firebaseUid);
  }

  async postMessage(input: CreateVendorChatMessageInput) {
    const message: ChatMessage = {
      id: randomUUID(),
      firebaseUid: input.firebaseUid,
      message: input.message,
      isFromUser: false,
      createdAt: new Date().toISOString(),
    };

    return this.repository.addMessage(message);
  }
}
