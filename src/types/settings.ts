export interface ModelSettings {
  id: string;
  whisper_model: string;
  gpt_model: string;
  created_at: string;
  updated_at: string;
}

export const AVAILABLE_WHISPER_MODELS = ['whisper-1'] as const;
export const AVAILABLE_GPT_MODELS = ['gpt-3.5-turbo', 'gpt-4', 'gpt-4o-mini'] as const;

export type WhisperModel = typeof AVAILABLE_WHISPER_MODELS[number];
export type GPTModel = typeof AVAILABLE_GPT_MODELS[number]; 