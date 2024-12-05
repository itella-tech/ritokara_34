export type PdfFile = {
  id: string;
  title: string;
  description: string;
  file_path: string;
  created_at: string;
  user_id: string;
};

export type CreatePdfFile = Omit<PdfFile, 'id' | 'created_at'>;

export type AudioLanguage = 'en' | 'zh';

export interface PdfPageAudio {
  id: string;
  pdf_file_id: string;
  page_number: number;
  language: AudioLanguage;
  audio_url: string | null;
  created_at: string;
  updated_at: string;
} 