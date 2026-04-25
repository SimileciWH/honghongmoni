import { AIProvider, ProviderType } from './provider';
import { QiniuyunProvider } from './qiniuyun-provider';
import { TTSProvider } from './tts-provider';
import { SiliconFlowTTSProvider } from './siliconflow-tts-provider';

export type { AIProvider, AIMessage, AIResponse, ChatOptions } from './provider';
export type { TTSProvider, TTSResponse, TTSOptions } from './tts-provider';

export function createAIProvider(type: ProviderType = 'qiniuyun'): AIProvider {
  switch (type) {
    case 'qiniuyun':
      return new QiniuyunProvider({
        apiKey: process.env.SILICONFLOW_API_KEY || process.env.QINIUYUN_API_KEY || '',
        baseUrl: process.env.SILICONFLOW_LLM_BASE_URL || process.env.QINIUYUN_BASE_URL || 'https://api.siliconflow.cn/v1',
        model: process.env.SILICONFLOW_LLM_MODEL || process.env.QINIUYUN_MODEL || 'deepseek-ai/DeepSeek-V3.2',
      });
    default:
      throw new Error(`Unknown AI provider type: ${type}`);
  }
}

export function createTTSProvider(type: string = 'siliconflow'): TTSProvider {
  switch (type) {
    case 'siliconflow':
      return new SiliconFlowTTSProvider({
        apiKey: process.env.SILICONFLOW_API_KEY || '',
        baseUrl: process.env.SILICONFLOW_BASE_URL || 'https://api.siliconflow.cn',
        model: process.env.SILICONFLOW_TTS_MODEL || 'fnlp/MOSS-TTSD-v0.5',
      });
    default:
      throw new Error(`Unknown TTS provider type: ${type}`);
  }
}
