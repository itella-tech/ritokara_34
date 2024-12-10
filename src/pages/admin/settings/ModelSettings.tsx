import { useEffect, useState } from 'react';
import { settingsService } from '@/services/settingsService';
import { ModelSettings, AVAILABLE_WHISPER_MODELS, AVAILABLE_GPT_MODELS, WhisperModel, GPTModel } from '@/types/settings';

const ModelSettingsPage = () => {
  const [settings, setSettings] = useState<ModelSettings | null>(null);
  const [whisperModel, setWhisperModel] = useState<WhisperModel>('whisper-1');
  const [gptModel, setGptModel] = useState<GPTModel>('gpt-3.5-turbo');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const settings = await settingsService.getModelSettings();
    if (settings) {
      setSettings(settings);
      setWhisperModel(settings.whisper_model as WhisperModel);
      setGptModel(settings.gpt_model as GPTModel);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      const result = await settingsService.updateModelSettings(whisperModel, gptModel);
      if (result) {
        setSettings(result);
        setMessage('設定を更新しました');
      }
    } catch (error) {
      setMessage('エラーが発生しました');
      console.error('Error updating settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">モデル設定</h1>
      
      <form onSubmit={handleSubmit} className="max-w-md">
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Whisperモデル
          </label>
          <select
            value={whisperModel}
            onChange={(e) => setWhisperModel(e.target.value as WhisperModel)}
            className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          >
            {AVAILABLE_WHISPER_MODELS.map((model) => (
              <option key={model} value={model}>
                {model}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            GPTモデル
          </label>
          <select
            value={gptModel}
            onChange={(e) => setGptModel(e.target.value as GPTModel)}
            className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          >
            {AVAILABLE_GPT_MODELS.map((model) => (
              <option key={model} value={model}>
                {model}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center justify-between">
          <button
            type="submit"
            disabled={isLoading}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
          >
            {isLoading ? '更新中...' : '設定を更新'}
          </button>
        </div>

        {message && (
          <div className="mt-4 text-sm text-gray-600">
            {message}
          </div>
        )}
      </form>
    </div>
  );
};

export default ModelSettingsPage; 