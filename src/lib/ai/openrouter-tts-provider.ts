import { TTSProvider, TTSResponse, TTSOptions, TTSProviderConfig } from './tts-provider';

const ERROR_MESSAGES: Record<number | string, string> = {
  401: 'API Key无效，请检查配置',
  403: 'API Key无权限，请联系管理员',
  429: '请求过于频繁，请稍后重试',
  500: 'TTS服务暂时不可用，请稍后重试',
  502: 'TTS服务暂时不可用，请稍后重试',
  503: 'TTS服务暂时不可用，请稍后重试',
  TIMEOUT: '请求超时，请检查网络',
  NETWORK: '网络连接失败，请检查网络',
};

function getErrorMessage(status: number | string): string {
  return ERROR_MESSAGES[status] || 'TTS服务异常，请稍后重试';
}

export class OpenRouterTTSProvider implements TTSProvider {
  private config: TTSProviderConfig;
  private timeout: number;

  constructor(config: TTSProviderConfig) {
    this.config = config;
    this.timeout = config.timeout || 60000;
  }

  async synthesize(options: TTSOptions): Promise<TTSResponse> {
    const startTime = Date.now();
    const requestId = `tts-${Date.now()}-${Math.random().toString(36).substring(7)}`;

    console.log(`[${requestId}] 🎙️ TTS Request started`, {
      provider: 'openrouter-tts',
      model: this.config.model,
      textLength: options.text.length,
      voice: options.voice || 'alloy',
      timestamp: new Date().toISOString(),
    });

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(`${this.config.baseUrl}/v1/audio/speech`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify({
          model: options.model || this.config.model,
          input: options.text,
          voice: options.voice || 'alloy',
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const duration = Date.now() - startTime;

      if (!response.ok) {
        let errorBody: { error?: { message?: string }; detail?: string } = {};
        try {
          const text = await response.text();
          console.error(`[${requestId}] ❌ TTS Response text:`, text);
          try {
            errorBody = JSON.parse(text);
          } catch {
            errorBody = { error: { message: text } };
          }
        } catch {
          // ignore parse error
        }

        const errorMessage = errorBody?.error?.message || getErrorMessage(response.status);
        
        console.error(`[${requestId}] ❌ TTS Request failed`, {
          provider: 'openrouter-tts',
          status: response.status,
          duration,
          error: errorMessage,
          errorDetail: errorBody,
          timestamp: new Date().toISOString(),
        });

        throw new Error(errorMessage);
      }

      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = Buffer.from(arrayBuffer);

      const result: TTSResponse = {
        audioData: audioBuffer,
        audioSize: audioBuffer.length,
      };

      console.log(`[${requestId}] ✅ TTS Request completed`, {
        provider: 'openrouter-tts',
        model: this.config.model,
        duration,
        audioSize: result.audioSize,
        timestamp: new Date().toISOString(),
      });

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const isAbort = errorMessage.includes('aborted');

      console.error(`[${requestId}] ❌ TTS Request error`, {
        provider: 'openrouter-tts',
        duration,
        error: isAbort ? 'TIMEOUT' : errorMessage,
        timestamp: new Date().toISOString(),
      });

      if (isAbort) {
        throw new Error(getErrorMessage('TIMEOUT'));
      }

      throw error;
    }
  }
}
