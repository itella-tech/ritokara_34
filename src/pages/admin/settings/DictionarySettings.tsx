import { useEffect, useState } from 'react';
import { dictionaryService } from '@/services/dictionaryService';
import AdminLayout from '@/components/layouts/AdminLayout';

const DictionarySettings = () => {
  const [terms, setTerms] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadDictionary();
  }, []);

  const loadDictionary = async () => {
    const dictionary = await dictionaryService.getDictionary();
    if (dictionary) {
      setTerms(dictionary.terms);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      const result = await dictionaryService.updateDictionary(terms);
      if (result) {
        setMessage('辞書を更新しました');
      }
    } catch (error) {
      setMessage('エラーが発生しました');
      console.error('Error updating dictionary:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-8">翻訳辞書設定</h1>
      
      <form onSubmit={handleSubmit} className="max-w-2xl">
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            固有名詞・地名リスト（改行区切り）
          </label>
          <textarea
            value={terms}
            onChange={(e) => setTerms(e.target.value)}
            className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            rows={10}
            placeholder="例：
東京都
渋谷区
原宿
..."
          />
          <p className="text-sm text-gray-600 mt-2">
            ※ 各用語は改行で区切って入力してください。
          </p>
        </div>

        <div className="flex items-center justify-between">
          <button
            type="submit"
            disabled={isLoading}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
          >
            {isLoading ? '更新中...' : '辞書を更新'}
          </button>
        </div>

        {message && (
          <div className="mt-4 text-sm text-gray-600">
            {message}
          </div>
        )}
      </form>
    </AdminLayout>
  );
};

export default DictionarySettings; 