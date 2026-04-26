export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AIUsage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}

export interface AIResponse {
  content: string;
  usage?: AIUsage;
  id?: string;
  model?: string;
  finish_reason?: string;
}

export interface ChatOptions {
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  stream?: boolean;
}

export interface AIProvider {
  chat(messages: AIMessage[], options?: ChatOptions): Promise<AIResponse>;
}

export interface ProviderConfig {
  apiKey: string;
  baseUrl: string;
  model: string;
  timeout?: number;
}

export type ProviderType = 'siliconflow' | 'qiniuyun' | 'openai';
