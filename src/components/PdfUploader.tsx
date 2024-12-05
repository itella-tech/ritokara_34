import { useState } from 'react';
import { pdfService } from '@/services/pdfService';
import { useUser } from '@/hooks/useUser';

export const PdfUploader = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useUser();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    
    if (!file) {
      setError('ファイルを選択してください。');
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      setError('ファイルサイズは50MB以下にしてください。');
      return;
    }

    try {
      setError(null);
      setIsUploading(true);
      
      const userId = user?.id || 'anonymous';
      await pdfService.uploadPdf(file, userId);
      
      setError(null);
      event.target.value = '';
    } catch (error) {
      console.error('Upload error:', error);
      setError('アップロードに失敗しました。もう一度お試しください。');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div>
      <input
        type="file"
        accept="application/pdf"
        onChange={handleFileUpload}
        disabled={isUploading}
      />
      {isUploading && <p>アップロード中...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}; 