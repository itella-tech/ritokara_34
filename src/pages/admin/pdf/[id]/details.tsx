import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Document, Page } from 'react-pdf';
import { PdfFile, PdfPageAudio, AudioLanguage } from '@/types/pdf';
import { pdfService } from '@/services/pdfService';
import AdminLayout from '@/components/layouts/AdminLayout';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';

const LANGUAGE_LABELS: Record<AudioLanguage, string> = {
  en: '英語',
  zh: '中国語'
};

export default function PdfDetail() {
  const { id } = useParams<{ id: string }>();
  const [pdf, setPdf] = useState<PdfFile | null>(null);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageAudios, setPageAudios] = useState<PdfPageAudio[]>([]);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfError, setPdfError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadPdfDetails(id);
    }
  }, [id]);

  const loadPdfDetails = async (pdfId: string) => {
    try {
      const pdfData = await pdfService.getPdfById(pdfId);
      setPdf(pdfData);
      if (pdfData) {
        const { data } = supabase.storage
          .from('pdfs')
          .getPublicUrl(pdfData.file_path);
        setPdfUrl(data.publicUrl);
        setPdfError(null);
      }
      const audios = await pdfService.getPdfPageAudios(pdfId);
      setPageAudios(audios);
    } catch (error) {
      console.error('Error loading PDF details:', error);
      setPdfError('Failed to load PDF details');
    }
  };

  const onDocumentLoadSuccess = ({ numPages: nextNumPages }: { numPages: number }) => {
    setNumPages(nextNumPages);
    setPdfError(null);
  };

  const onDocumentLoadError = (error: Error) => {
    console.error('Error loading PDF:', error);
    setPdfError('Failed to load PDF. Please try again.');
  };

  const handleAudioUpload = async (pageNumber: number, language: AudioLanguage, file: File) => {
    if (!pdf) return;
    try {
      await pdfService.uploadPageAudio(pdf.id, pageNumber, language, file);
      const audios = await pdfService.getPdfPageAudios(pdf.id);
      setPageAudios(audios);
    } catch (error) {
      console.error('Error uploading audio:', error);
    }
  };

  const handleAudioDelete = async (pageNumber: number, language: AudioLanguage) => {
    if (!pdf) return;
    try {
      await pdfService.deletePageAudio(pdf.id, pageNumber, language);
      const audios = await pdfService.getPdfPageAudios(pdf.id);
      setPageAudios(audios);
    } catch (error) {
      console.error('Error deleting audio:', error);
    }
  };

  const getPageAudio = (pageNumber: number, language: AudioLanguage) => {
    return pageAudios.find(audio => 
      audio.page_number === pageNumber && 
      audio.language === language
    );
  };

  if (!pdf) return <div>Loading...</div>;
  if (!pdfUrl) return <div>PDF URL not found</div>;

  return (
    <AdminLayout>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">{pdf.title}</h1>
        {pdf.description && (
          <p className="text-gray-600 mb-4">{pdf.description}</p>
        )}
        
        {pdfError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {pdfError}
          </div>
        )}

        <Document
          file={pdfUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={onDocumentLoadError}
          loading={<div>Loading PDF...</div>}
          error={<div>Failed to load PDF. Please try again.</div>}
          className="pdf-document"
        >
          {numPages && Array.from(new Array(numPages), (_, index) => (
            <div key={`page_${index + 1}`} className="mb-8">
              <div className="flex flex-col gap-4 mb-2">
                <h2 className="text-lg font-semibold">Page {index + 1}</h2>
                {(['en', 'zh'] as AudioLanguage[]).map((language) => {
                  const audio = getPageAudio(index + 1, language);
                  return (
                    <div key={language} className="flex items-center gap-2">
                      <span className="w-20">{LANGUAGE_LABELS[language]}:</span>
                      <input
                        type="file"
                        accept="audio/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleAudioUpload(index + 1, language, file);
                        }}
                        className="hidden"
                        id={`audio-upload-${index + 1}-${language}`}
                      />
                      <label
                        htmlFor={`audio-upload-${index + 1}-${language}`}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded cursor-pointer"
                      >
                        {audio ? '音声を更新' : '音声を追加'}
                      </label>
                      {audio && (
                        <>
                          <audio controls className="max-w-md">
                            <source src={audio.audio_url || ''} />
                          </audio>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleAudioDelete(index + 1, language)}
                          >
                            削除
                          </Button>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
              <Page
                pageNumber={index + 1}
                renderTextLayer={false}
                renderAnnotationLayer={false}
                loading={<div>Loading page {index + 1}...</div>}
                error={<div>Error loading page {index + 1}</div>}
              />
            </div>
          ))}
        </Document>
      </div>
    </AdminLayout>
  );
} 