import { useState, useEffect, useRef } from "react";
import { Button } from "./ui/button";
import { Play, Pause, Mic, MicOff } from "lucide-react";
import { translationService } from "@/services/translationService";
import { SpeechService, SPEECH_LANGUAGES, SpeechLanguage } from "@/services/speechService";
import { AudioLanguage } from "@/types/pdf";

interface AudioPlayerProps {
  audioUrl: string;
  onLanguageChange: (language: string) => void;
  currentLanguage: AudioLanguage;
}

export function AudioPlayer({ audioUrl, onLanguageChange, currentLanguage }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isInterpreting, setIsInterpreting] = useState(false);
  const [translatedText, setTranslatedText] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const speechServiceRef = useRef<SpeechService | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio(audioUrl);
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [audioUrl]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleSpeechResult = async (text: string) => {
    try {
      setIsProcessing(true);
      // 選択された言語から日本語へ、または日本語から選択された言語への翻訳
      const fromLang = SPEECH_LANGUAGES[currentLanguage as SpeechLanguage];
      const toLang = SPEECH_LANGUAGES.ja;
      
      const translatedText = await translationService.translateText(text, fromLang, toLang);
      setTranslatedText(translatedText);

      // 翻訳されたテキストを音声合成で読み上げ
      if (speechServiceRef.current) {
        speechServiceRef.current.speak(translatedText);
      }
    } catch (error) {
      console.error('Translation error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAudioData = async (audioBlob: Blob) => {
    try {
      setIsProcessing(true);
      const fromLang = SPEECH_LANGUAGES[currentLanguage as SpeechLanguage];
      const toLang = SPEECH_LANGUAGES.ja;
      
      const translatedText = await translationService.translateAudio(audioBlob, fromLang, toLang);
      setTranslatedText(translatedText);

      if (speechServiceRef.current) {
        speechServiceRef.current.speak(translatedText);
      }
    } catch (error) {
      console.error('Audio translation error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleInterpretation = async () => {
    if (!isInterpreting) {
      try {
        setIsInterpreting(true);
        // 音声認識サービスの初期化と開始
        speechServiceRef.current = new SpeechService(
          SPEECH_LANGUAGES[currentLanguage as SpeechLanguage],
          handleSpeechResult,
          handleAudioData
        );
        await speechServiceRef.current.startListening();
      } catch (error) {
        console.error('Interpretation error:', error);
        setIsInterpreting(false);
      }
    } else {
      if (speechServiceRef.current) {
        await speechServiceRef.current.stopListening();
      }
      setIsInterpreting(false);
      setTranslatedText("");
    }
  };

  // 言語が変更されたときの処理
  useEffect(() => {
    if (speechServiceRef.current && isInterpreting) {
      speechServiceRef.current.setLanguage(SPEECH_LANGUAGES[currentLanguage as SpeechLanguage]);
    }
  }, [currentLanguage]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 p-4 bg-white rounded-lg shadow border border-gray-200">
        <Button
          variant="outline"
          size="icon"
          onClick={togglePlay}
          className="h-10 w-10"
        >
          {isPlaying ? (
            <Pause className="h-4 w-4" />
          ) : (
            <Play className="h-4 w-4" />
          )}
        </Button>

        <Button
          variant={isInterpreting ? "destructive" : "default"}
          onClick={toggleInterpretation}
          className="flex items-center gap-2"
          disabled={isProcessing}
        >
          {isInterpreting ? (
            <>
              <MicOff className="h-4 w-4" />
              通訳を終了
            </>
          ) : (
            <>
              <Mic className="h-4 w-4" />
              通訳を開始
            </>
          )}
        </Button>

        <div className="text-sm text-gray-500">
          {isInterpreting && (
            isProcessing ? "処理中..." : `${currentLanguage === 'en' ? '英語' : '中国語'}で通訳中`
          )}
        </div>
      </div>

      {isInterpreting && (
        <div className="p-4 bg-white rounded-lg shadow border border-gray-200">
          <div className="font-medium text-gray-700 mb-2">通訳テキスト:</div>
          <div className="text-gray-600 min-h-[50px]">
            {isProcessing ? (
              <div className="animate-pulse">音声を処理中...</div>
            ) : (
              translatedText || "通訳を待機中..."
            )}
          </div>
        </div>
      )}
    </div>
  );
}