import { supabase } from '@/lib/supabaseClient';
import { CreatePdfFile, PdfFile, PdfPageAudio, AudioLanguage } from '@/types/pdf';

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

      // データベースに保存
      const pdfData: CreatePdfFile = {
        title: file.name,
        description: '',
        file_path: filePath,
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
  },

  async getPdfById(id: string): Promise<PdfFile | null> {
    const { data, error } = await supabase
      .from('pdf_files')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching PDF:', error);
      return null;
    }

    return data;
  },

  async uploadPageAudio(
    pdfId: string,
    pageNumber: number,
    language: AudioLanguage,
    file: File
  ): Promise<PdfPageAudio | null> {
    try {
      const timestamp = Date.now();
      const extension = file.name.split('.').pop();
      const filePath = `audio/${pdfId}/${pageNumber}_${language}_${timestamp}.${extension}`;

      // 既存の音声ファイルを確認
      const { data: existingAudio } = await supabase
        .from('pdf_page_audio')
        .select('*')
        .eq('pdf_file_id', pdfId)
        .eq('page_number', pageNumber)
        .eq('language', language)
        .single();

      // 既存の音声ファイルがある場合は削除
      if (existingAudio?.audio_url) {
        const oldPath = existingAudio.audio_url.split('/').pop();
        if (oldPath) {
          await supabase.storage
            .from('audio')
            .remove([`audio/${pdfId}/${oldPath}`]);
        }
      }

      // 新しい音声ファイルをアップロード
      const { error: storageError } = await supabase.storage
        .from('audio')
        .upload(filePath, file);

      if (storageError) throw storageError;

      const { data: { publicUrl } } = supabase.storage
        .from('audio')
        .getPublicUrl(filePath);

      // データベースを更新
      const { data, error } = await supabase
        .from('pdf_page_audio')
        .upsert({
          pdf_file_id: pdfId,
          page_number: pageNumber,
          language,
          audio_url: publicUrl
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error uploading audio:', error);
      return null;
    }
  },

  async deletePageAudio(
    pdfId: string,
    pageNumber: number,
    language: AudioLanguage
  ): Promise<void> {
    try {
      const { data: audio } = await supabase
        .from('pdf_page_audio')
        .select('*')
        .eq('pdf_file_id', pdfId)
        .eq('page_number', pageNumber)
        .eq('language', language)
        .single();

      if (audio?.audio_url) {
        const filePath = audio.audio_url.split('/').pop();
        if (filePath) {
          // ストレージから音声ファイルを削除
          await supabase.storage
            .from('audio')
            .remove([`audio/${pdfId}/${filePath}`]);
        }
      }

      // データベースから音声情報を削除
      await supabase
        .from('pdf_page_audio')
        .delete()
        .eq('pdf_file_id', pdfId)
        .eq('page_number', pageNumber)
        .eq('language', language);
    } catch (error) {
      console.error('Error deleting audio:', error);
      throw error;
    }
  },

  async getPdfPageAudios(pdfId: string): Promise<PdfPageAudio[]> {
    const { data, error } = await supabase
      .from('pdf_page_audio')
      .select('*')
      .eq('pdf_file_id', pdfId)
      .order('page_number');

    if (error) {
      console.error('Error fetching page audios:', error);
      return [];
    }

    return data || [];
  }
}; 