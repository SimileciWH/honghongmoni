export interface TTSResponse {
  audioData: Buffer;
  audioSize: number;
}

export interface TTSOptions {
  text: string;
  voice?: string;
  model?: string;
}

export interface TTSProvider {
  synthesize(options: TTSOptions): Promise<TTSResponse>;
}

export interface TTSProviderConfig {
  apiKey: string;
  baseUrl: string;
  model: string;
  timeout?: number;
}
