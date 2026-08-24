import { SupportRepository } from '../../repositories/user/supportRepository.js';
import {
  CreateChatMessageInput,
  CreateReportInput,
  CreateSuggestionInput,
  ChatMessage,
  Report,
  Suggestion,
  WeatherResponse,
} from '../../models/supportModels.js';

export class SupportService {
  constructor(private readonly repository = new SupportRepository()) {}

  async getMessages(firebaseUid: string) {
    return this.repository.getMessagesByUser(firebaseUid);
  }

  async postMessage(input: CreateChatMessageInput) {
    const message: ChatMessage = {
      id: crypto.randomUUID(),
      firebaseUid: input.firebaseUid,
      message: input.message,
      isFromUser: true,
      createdAt: new Date().toISOString(),
    };

    return this.repository.addMessage(message);
  }

  async postReport(input: CreateReportInput) {
    const report: Report = {
      id: crypto.randomUUID(),
      firebaseUid: input.firebaseUid,
      issue: input.issue,
      description: input.description,
      status: 'pending',
      createdAt: new Date().toISOString(),
      resolvedAt: null,
    };

    return this.repository.addReport(report);
  }

  async getReports(firebaseUid: string) {
    return this.repository.getReportsByUser(firebaseUid);
  }

  async getSuggestions(firebaseUid: string) {
    return this.repository.getSuggestionsByUser(firebaseUid);
  }

  async getWeather(location = 'oyo'): Promise<WeatherResponse> {
    const hour = new Date().getHours();
    let timeOfDay = 'day';
    if (hour >= 5 && hour < 12) timeOfDay = 'morning';
    else if (hour >= 12 && hour < 17) timeOfDay = 'afternoon';
    else if (hour >= 17 && hour < 21) timeOfDay = 'evening';
    else timeOfDay = 'night';

    const apiKey = process.env.OPENWEATHER_API_KEY;
    if (!apiKey) {
      return {
        condition: 'Clear',
        temperature: 28,
        humidity: 60,
        timeOfDay,
        location,
      };
    }

    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(location)}&appid=${apiKey}&units=metric`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch weather data');
    }

    const data = await response.json();
    let condition = 'Unknown';
    let temperature = 0;
    let humidity = 0;

    if (Array.isArray(data.weather) && data.weather.length > 0) {
      condition = String(data.weather[0]?.main ?? 'Unknown');
    }
    if (data.main) {
      temperature = Number(data.main.temp ?? 0);
      humidity = Number(data.main.humidity ?? 0);
    }

    return {
      condition,
      temperature,
      humidity,
      timeOfDay,
      location,
    };
  }

  async addSuggestion(input: CreateSuggestionInput) {
    const suggestion: Suggestion = {
      id: crypto.randomUUID(),
      firebaseUid: input.firebaseUid,
      title: input.title,
      description: input.description,
      createdAt: new Date().toISOString(),
    };

    return this.repository.addSuggestion(suggestion);
  }
}
