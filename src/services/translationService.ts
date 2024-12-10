import OpenAI from 'openai';
import { settingsService } from './settingsService';
import { dictionaryService } from './dictionaryService';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

export const translationService = {
  async transcribeAudio(audioBlob: Blob): Promise<{ text: string; language: string }> {
    try {
      const settings = await settingsService.getModelSettings();
      const whisperModel = settings?.whisper_model || 'whisper-1';

      const file = new File([audioBlob], 'audio.wav', { type: audioBlob.type });

      const transcriptionResponse = await openai.audio.transcriptions.create({
        file: file,
        model: whisperModel,
        response_format: "verbose_json"
      });

      return {
        text: transcriptionResponse.text,
        language: transcriptionResponse.language
      };
    } catch (error) {
      console.error('Transcription error:', error);
      throw error;
    }
  },

  async translateAudio(audioBlob: Blob, fromLang: string, toLang: string): Promise<string> {
    try {
      const { text, language } = await this.transcribeAudio(audioBlob);
      return await this.translateText(text, language, toLang);
    } catch (error) {
      console.error('Translation error:', error);
      throw error;
    }
  },

  async translateText(text: string, fromLang: string, toLang: string): Promise<string> {
    try {
      const settings = await settingsService.getModelSettings();
      const dictionary = await dictionaryService.getDictionary();
      const gptModel = settings?.gpt_model || 'gpt-3.5-turbo';

      const dictionaryPrompt = dictionary ? dictionaryService.formatTermsForPrompt(dictionary.terms) : '';

      const chatResponse = await openai.chat.completions.create({
        model: gptModel,
        messages: [
          {
            role: "system",
            content: `You are a professional interpreter. Translate from ${fromLang} to ${toLang} naturally and fluently.${dictionaryPrompt}`
          },
          {
            role: "user",
            content: text
          }
        ],
      });

      return chatResponse.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('Text translation error:', error);
      throw error;
    }
  }
}; 