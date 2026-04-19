import { AIProvider, ProviderType } from './provider';
import { QiniuyunProvider } from './qiniuyun-provider';

export type { AIProvider, AIMessage, AIResponse, ChatOptions } from './provider';

export function createAIProvider(type: ProviderType = 'qiniuyun'): AIProvider {
  switch (type) {
    case 'qiniuyun':
      return new QiniuyunProvider({
        apiKey: process.env.QINIUYUN_API_KEY || '',
        baseUrl: process.env.QINIUYUN_BASE_URL || 'https://api.qnaigc.com/v1',
        model: process.env.QINIUYUN_MODEL || 'deepseek/deepseek-v3.2-251201',
      });
    default:
      throw new Error(`Unknown AI provider type: ${type}`);
  }
}
