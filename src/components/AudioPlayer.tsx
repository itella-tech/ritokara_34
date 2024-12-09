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
  const [detectedLanguage, setDetectedLanguage] = useState<string>("");
  const [translationDirection, setTranslationDirection] = useState<string>("");
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

  // 通訳終了時に状態をリセット
  const resetTranslationState = () => {
    setTranslatedText("");
    setDetectedLanguage("");
    setTranslationDirection("");
  };

  const handleSpeechResult = async (text: string) => {
    try {
      setIsProcessing(true);
      // 日本語で話した場合は選択された言語へ、それ以外の場合は日本語へ翻訳
      const isJapanese = detectJapanese(text);
      const fromLang = isJapanese ? SPEECH_LANGUAGES.ja : SPEECH_LANGUAGES[currentLanguage as SpeechLanguage];
      const toLang = isJapanese ? SPEECH_LANGUAGES[currentLanguage as SpeechLanguage] : SPEECH_LANGUAGES.ja;
      
      // 検出された言語を表示
      setDetectedLanguage(isJapanese ? 'ja' : currentLanguage);
      setTranslationDirection(`${fromLang} → ${toLang}`);

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
      // Whisper APIで音声認識と言語検出を行う
      const { text, language } = await translationService.transcribeAudio(audioBlob);
      
      // 検出された言語に基づいて翻訳方向を決定
      const isJapanese = language === 'ja' || language === 'japanese';
      const fromLang = isJapanese ? SPEECH_LANGUAGES.ja : SPEECH_LANGUAGES[currentLanguage as SpeechLanguage];
      const toLang = isJapanese ? SPEECH_LANGUAGES[currentLanguage as SpeechLanguage] : SPEECH_LANGUAGES.ja;

      // 検出された言語と翻訳方向を更新
      setDetectedLanguage(language);
      setTranslationDirection(`${fromLang} → ${toLang}`);

      const translatedText = await translationService.translateText(text, fromLang, toLang);
      setTranslatedText(translatedText);

      // 翻訳されたテキストを音声合成で読み上げ
      if (speechServiceRef.current) {
        speechServiceRef.current.speak(translatedText);
      }
    } catch (error) {
      console.error('Audio translation error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  // 日本語かどうかを判定する関数
  const detectJapanese = (text: string): boolean => {
    // 日本語の文字コード範囲を定義
    const japaneseRanges = [
      { from: 0x3040, to: 0x309F }, // ひらがな
      { from: 0x30A0, to: 0x30FF }, // カタカナ
      { from: 0x4E00, to: 0x9FFF }, // 漢字
    ];

    // テキストに日本語が含まれているかチェック
    return text.split('').some(char => {
      const code = char.charCodeAt(0);
      return japaneseRanges.some(range => code >= range.from && code <= range.to);
    });
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
        resetTranslationState();
      }
    } else {
      if (speechServiceRef.current) {
        await speechServiceRef.current.stopListening();
      }
      setIsInterpreting(false);
      resetTranslationState();
    }
  };

  // 言語が変更されたときの処理
  useEffect(() => {
    if (speechServiceRef.current && isInterpreting) {
      speechServiceRef.current.setLanguage(SPEECH_LANGUAGES[currentLanguage as SpeechLanguage]);
      resetTranslationState();
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
        <div className="space-y-4">
          <div className="p-4 bg-white rounded-lg shadow border border-gray-200">
            <div className="space-y-2">
              <div className="text-sm text-gray-500">
                検出された言語: {detectedLanguage ? (
                  detectedLanguage === 'ja' || detectedLanguage === 'japanese' ? '日本語' :
                  detectedLanguage === 'en' ? '英語' :
                  detectedLanguage === 'zh' ? '中国語' :
                  detectedLanguage
                ) : "待機中..."}
              </div>
              <div className="text-sm text-gray-500">
                翻訳方向: {translationDirection || "待機中..."}
              </div>
            </div>
          </div>

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
        </div>
      )}
    </div>
  );
}