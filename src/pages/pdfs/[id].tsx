import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Document, Page, pdfjs } from 'react-pdf';
import { PdfFile, PdfPageAudio } from '@/types/pdf';
import { pdfService } from '@/services/pdfService';

// PDFワーカーの設定
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

export default function PdfDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [pdf, setPdf] = useState<PdfFile | null>(null);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageAudios, setPageAudios] = useState<PdfPageAudio[]>([]);

  useEffect(() => {
    if (id && typeof id === 'string') {
      loadPdfDetails(id);
    }
  }, [id]);

  const loadPdfDetails = async (pdfId: string) => {
    try {
      const pdfData = await pdfService.getPdfById(pdfId);
      setPdf(pdfData);
      const audios = await pdfService.getPdfPageAudios(pdfId);
      setPageAudios(audios);
    } catch (error) {
      console.error('Error loading PDF details:', error);
    }
  };

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  const handleAudioUpload = async (pageNumber: number, file: File) => {
    if (!pdf) return;
    try {
      await pdfService.uploadPageAudio(pdf.id, pageNumber, file);
      // 音声一覧を再読み込み
      const audios = await pdfService.getPdfPageAudios(pdf.id);
      setPageAudios(audios);
    } catch (error) {
      console.error('Error uploading audio:', error);
    }
  };

  if (!pdf) return <div>Loading...</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{pdf.name}</h1>
      
      <Document
        file={pdf.url}
        onLoadSuccess={onDocumentLoadSuccess}
        className="pdf-document"
      >
        {Array.from(new Array(numPages), (_, index) => (
          <div key={`page_${index + 1}`} className="mb-8">
            <div className="flex items-center gap-4 mb-2">
              <h2 className="text-lg font-semibold">Page {index + 1}</h2>
              <input
                type="file"
                accept="audio/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleAudioUpload(index + 1, file);
                }}
              />
              {pageAudios.find(audio => audio.page_number === index + 1) && (
                <audio controls>
                  <source src={pageAudios.find(audio => audio.page_number === index + 1)?.audio_url || ''} />
                </audio>
              )}
            </div>
            <Page
              pageNumber={index + 1}
              renderTextLayer={false}
              renderAnnotationLayer={false}
            />
          </div>
        ))}
      </Document>
    </div>
  );
} 