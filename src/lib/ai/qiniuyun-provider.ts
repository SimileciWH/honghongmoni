import { AIProvider, AIMessage, AIResponse, ChatOptions, ProviderConfig } from './provider';

const ERROR_MESSAGES: Record<number | string, string> = {
  401: 'API Key无效，请检查配置',
  403: 'API Key无权限，请联系管理员',
  429: '请求过于频繁，请稍后重试',
  500: 'AI服务暂时不可用，请稍后重试',
  502: 'AI服务暂时不可用，请稍后重试',
  503: 'AI服务暂时不可用，请稍后重试',
  TIMEOUT: '请求超时，请检查网络',
  NETWORK: '网络连接失败，请检查网络',
};

function getErrorMessage(status: number | string): string {
  return ERROR_MESSAGES[status] || 'AI服务异常，请稍后重试';
}

export class QiniuyunProvider implements AIProvider {
  private config: ProviderConfig;
  private timeout: number;

  constructor(config: ProviderConfig) {
    this.config = config;
    this.timeout = config.timeout || 60000;
  }

  private getProviderName(): string {
    if (this.config.baseUrl.includes('siliconflow.cn')) {
      return 'siliconflow';
    }
    if (this.config.baseUrl.includes('openrouter.ai')) {
      return 'openrouter';
    }
    return 'qiniuyun';
  }

  async chat(messages: AIMessage[], options?: ChatOptions): Promise<AIResponse> {
    const startTime = Date.now();
    const requestId = `req-${Date.now()}-${Math.random().toString(36).substring(7)}`;

    console.log(`[${requestId}] 🚀 AI Request started`, {
      provider: this.getProviderName(),
      model: this.config.model,
      messageCount: messages.length,
      timestamp: new Date().toISOString(),
    });

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const requestBody: Record<string, unknown> = {
        model: this.config.model,
        messages: messages.map(msg => ({
          role: msg.role,
          content: msg.content,
        })),
        stream: false,
      };

      if (options?.temperature !== undefined) {
        requestBody.temperature = options.temperature;
      }
      if (options?.max_tokens !== undefined) {
        requestBody.max_tokens = options.max_tokens;
      }
      if (options?.top_p !== undefined) {
        requestBody.top_p = options.top_p;
      }
      if (options?.frequency_penalty !== undefined) {
        requestBody.frequency_penalty = options.frequency_penalty;
      }
      if (options?.presence_penalty !== undefined) {
        requestBody.presence_penalty = options.presence_penalty;
      }

      const response = await fetch(`${this.config.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const duration = Date.now() - startTime;

      if (!response.ok) {
        let errorBody: { error?: { message?: string } } = {};
        try {
          errorBody = await response.json();
        } catch {
          // ignore JSON parse error
        }

        const errorMessage = getErrorMessage(response.status);
        
        console.error(`[${requestId}] ❌ AI Request failed`, {
          provider: this.getProviderName(),
          status: response.status,
          duration,
          error: errorMessage,
          errorDetail: errorBody?.error?.message || 'Unknown error',
          timestamp: new Date().toISOString(),
        });

        throw new Error(errorMessage);
      }

      const data = await response.json();

      const result: AIResponse = {
        content: data.choices?.[0]?.message?.content || '',
        usage: data.usage ? {
          prompt_tokens: data.usage.prompt_tokens,
          completion_tokens: data.usage.completion_tokens,
          total_tokens: data.usage.total_tokens,
        } : undefined,
        id: data.id,
        model: data.model,
        finish_reason: data.choices?.[0]?.finish_reason,
      };

      console.log(`[${requestId}] ✅ AI Request completed`, {
        provider: this.getProviderName(),
        model: this.config.model,
        duration,
        tokens: result.usage,
        timestamp: new Date().toISOString(),
      });

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const isAbort = errorMessage.includes('aborted');

      console.error(`[${requestId}] ❌ AI Request error`, {
        provider: this.getProviderName(),
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
