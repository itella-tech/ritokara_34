import { SpeechRecognition, SpeechRecognitionEvent } from '@/types/speech';

export class SpeechService {
  private recognition: SpeechRecognition;
  private synthesis: SpeechSynthesisUtterance;
  private isListening: boolean = false;
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];

  constructor(language: string, onResult: (text: string) => void, onAudioData?: (blob: Blob) => void) {
    // 音声認識の設定
    this.recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = language;

    this.recognition.onresult = (event: SpeechRecognitionEvent) => {
      const result = event.results[event.results.length - 1];
      if (result.isFinal) {
        onResult(result[0].transcript);
      }
    };

    this.recognition.onerror = (event: SpeechRecognitionEvent) => {
      console.error('Speech recognition error:', event.error);
    };

    // 音声合成の設定
    this.synthesis = new SpeechSynthesisUtterance();
    this.synthesis.lang = language;

    // 音声録音の設定
    if (onAudioData) {
      this.setupMediaRecorder(onAudioData);
    }
  }

  private async setupMediaRecorder(onAudioData: (blob: Blob) => void) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(stream);

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/wav' });
        onAudioData(audioBlob);
        this.audioChunks = [];
      };
    } catch (error) {
      console.error('Media recorder setup error:', error);
    }
  }

  async startListening() {
    if (!this.isListening) {
      this.isListening = true;
      this.recognition.start();
      if (this.mediaRecorder && this.mediaRecorder.state === 'inactive') {
        this.mediaRecorder.start();
      }
    }
  }

  async stopListening() {
    if (this.isListening) {
      this.isListening = false;
      this.recognition.stop();
      if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
        this.mediaRecorder.stop();
      }
    }
  }

  speak(text: string) {
    this.synthesis.text = text;
    window.speechSynthesis.speak(this.synthesis);
  }

  setLanguage(language: string) {
    this.recognition.lang = language;
    this.synthesis.lang = language;
  }
}

// 言語コードの定義
export const SPEECH_LANGUAGES = {
  ja: 'ja-JP',
  en: 'en-US',
  zh: 'zh-CN'
} as const;

export type SpeechLanguage = keyof typeof SPEECH_LANGUAGES; 