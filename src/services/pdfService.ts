import { supabase } from '@/lib/supabaseClient';
import { CreatePdfFile, PdfFile } from '@/types/pdf';

const STORAGE_BUCKET = 'pdfs';

export const pdfService = {
  async uploadPdf(file: File, userId: string): Promise<PdfFile | null> {
    try {
      // ファイル名をシンプルに保持
      const timestamp = Date.now();
      const extension = file.name.split('.').pop();
      const filePath = `${timestamp}.${extension}`;

      // Blobとしてファイルを準備
      const blob = new Blob([await file.arrayBuffer()], { type: 'application/pdf' });

      // ファイルをアップロード
      const { data: storageData, error: storageError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(filePath, blob, {
          contentType: 'application/pdf',
          cacheControl: '3600'
        });

      if (storageError) {
        console.error('Storage error:', storageError);
        throw storageError;
      }

      // 公開URLを取得
      const { data: { publicUrl } } = supabase.storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(filePath);

      // データベースに保存
      const pdfData: CreatePdfFile = {
        name: file.name,
        url: publicUrl,
        user_id: userId
      }; 

      const { data, error } = await supabase
        .from('pdf_files')
        .insert(pdfData)
        .select()
        .single();

      if (error) {
        console.error('Database error:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Upload error:', error);
      throw error; // エラーを上位に伝播させる
    }
  },

  async getPdfsByUserId(userId: string): Promise<PdfFile[]> {
    const { data, error } = await supabase
      .from('pdf_files')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching PDFs:', error);
      return [];
    }

    return data || [];
  }
}; 