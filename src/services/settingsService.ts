import { supabase } from '@/lib/supabaseClient';
import { ModelSettings, WhisperModel, GPTModel } from '@/types/settings';

export const settingsService = {
  async getModelSettings(): Promise<ModelSettings | null> {
    const { data, error } = await supabase
      .from('model_settings')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      console.error('Error fetching model settings:', error);
      return null;
    }

    return data;
  },

  async updateModelSettings(whisperModel: WhisperModel, gptModel: GPTModel): Promise<ModelSettings | null> {
    const { data, error } = await supabase
      .from('model_settings')
      .insert([
        {
          whisper_model: whisperModel,
          gpt_model: gptModel,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Error updating model settings:', error);
      return null;
    }

    return data;
  },
}; 