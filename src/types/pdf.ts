export type PdfFile = {
  id: string;
  name: string;
  url: string;
  created_at: string;
  user_id: string;
};

export type CreatePdfFile = Omit<PdfFile, 'id' | 'created_at'>; 