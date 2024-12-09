import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

export const translationService = {
  async transcribeAudio(audioBlob: Blob): Promise<{ text: string; language: string }> {
    try {
      const transcriptionResponse = await openai.audio.transcriptions.create({
        file: new File([audioBlob], "audio.wav"),
        model: "whisper-1",
        response_format: "verbose_json",
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
      const { text } = await this.transcribeAudio(audioBlob);
      return await this.translateText(text, fromLang, toLang);
    } catch (error) {
      console.error('Translation error:', error);
      throw error;
    }
  },

  async translateText(text: string, fromLang: string, toLang: string): Promise<string> {
    try {
      const chatResponse = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: `You are a professional interpreter. Translate from ${fromLang} to ${toLang} naturally and fluently.`
          },
          {
            role: "user",
            content: text
          }
        ]
      });

      return chatResponse.choices[0].message.content || '';
    } catch (error) {
      console.error('Text translation error:', error);
      throw error;
    }
  }
}; 