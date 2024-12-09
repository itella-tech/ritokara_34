import { useEffect, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { PdfFile, PdfPageAudio, AudioLanguage } from "@/types/pdf";
import { pdfService } from "@/services/pdfService";
import { supabase } from "@/lib/supabaseClient";
import { useLanguageStore } from "@/stores/languageStore";
import { AudioPlayer } from "@/components/AudioPlayer";
import Header from "@/components/Header";

// PDFワーカーの設定
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const LANGUAGE_LABELS: Record<AudioLanguage, string> = {
  en: '英語',
  zh: '中国語'
};

const Index = () => {
  const { currentLanguage, setLanguage } = useLanguageStore();
  const [pdfs, setPdfs] = useState<PdfFile[]>([]);
  const [selectedPdf, setSelectedPdf] = useState<PdfFile | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageAudios, setPageAudios] = useState<PdfPageAudio[]>([]);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);

  useEffect(() => {
    loadPdfs();
  }, []);

  useEffect(() => {
    if (selectedPdf) {
      loadPdfDetails(selectedPdf);
    }
  }, [selectedPdf]);

  useEffect(() => {
    handleLanguageChange(currentLanguage);
  }, [currentLanguage]);

  useEffect(() => {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      const audio = getCurrentPageAudio();
      if (audio) {
        currentAudio.src = audio.audio_url || '';
      }
    }
  }, [currentLanguage, currentPage]);

  const loadPdfs = async () => {
    try {
      const userId = "user123"; // TODO: 実際のユーザーIDを使用
      const pdfFiles = await pdfService.getPdfsByUserId(userId);
      setPdfs(pdfFiles);
    } catch (error) {
      console.error('Error loading PDFs:', error);
    }
  };

  const loadPdfDetails = async (pdf: PdfFile) => {
    try {
      const { data } = supabase.storage
        .from('pdfs')
        .getPublicUrl(pdf.file_path);
      setPdfUrl(data.publicUrl);
      
      const audios = await pdfService.getPdfPageAudios(pdf.id);
      setPageAudios(audios);
      setCurrentPage(1);
    } catch (error) {
      console.error('Error loading PDF details:', error);
    }
  };

  const onDocumentLoadSuccess = ({ numPages: nextNumPages }: { numPages: number }) => {
    setNumPages(nextNumPages);
  };

  const handlePageChange = (newPage: number) => {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    }
    setCurrentPage(newPage);
  };

  const getCurrentPageAudio = () => {
    return pageAudios.find(audio => 
      audio.page_number === currentPage && 
      audio.language === currentLanguage
    );
  };

  const handleLanguageChange = (language: AudioLanguage) => {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    }
    setLanguage(language);
  };

  const handleReturnToList = () => {
    setSelectedPdf(null);
    setPdfUrl(null);
    setNumPages(null);
    setCurrentPage(1);
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    }
    setCurrentAudio(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onReturnToList={handleReturnToList} />
      <div className="container max-w-6xl mx-auto py-8">
        <div className="mb-8">
          <AudioPlayer
            audioUrl=""
            onLanguageChange={setLanguage}
            currentLanguage={currentLanguage}
          />
        </div>
        {!selectedPdf ? (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-8">PDF一覧</h2>
            <div className="grid gap-4">
              {pdfs.map((pdf) => (
                <div 
                  key={pdf.id} 
                  className="bg-white p-4 rounded-lg shadow cursor-pointer hover:bg-gray-50"
                  onClick={() => setSelectedPdf(pdf)}
                >
                  <h3 className="text-xl font-semibold">{pdf.title}</h3>
                  {pdf.description && (
                    <p className="text-gray-600 mt-2">{pdf.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div>
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900">{selectedPdf.title}</h2>
              <button
                onClick={handleReturnToList}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                一覧に戻る
              </button>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <div className="flex gap-4">
                  <button
                    onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-300"
                  >
                    前のページ
                  </button>
                  <button
                    onClick={() => handlePageChange(Math.min(numPages || 1, currentPage + 1))}
                    disabled={currentPage === numPages}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-300"
                  >
                    次のページ
                  </button>
                </div>
              </div>

              {getCurrentPageAudio() && (
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-gray-600">現在の音声: {LANGUAGE_LABELS[currentLanguage]}</span>
                  </div>
                  <audio
                    controls
                    className="w-full"
                    key={`${currentPage}-${currentLanguage}`}
                    ref={(audio) => {
                      if (audio) {
                        setCurrentAudio(audio);
                      }
                    }}
                  >
                    <source src={getCurrentPageAudio()?.audio_url || ''} />
                  </audio>
                </div>
              )}

              {pdfUrl && (
                <Document
                  file={pdfUrl}
                  onLoadSuccess={onDocumentLoadSuccess}
                  loading={<div>PDFを読み込み中...</div>}
                  error={<div>PDFの読み込みに失敗しました。</div>}
                  className="pdf-document"
                >
                  <Page
                    pageNumber={currentPage}
                    renderTextLayer={false}
                    renderAnnotationLayer={false}
                    loading={<div>ページを読み込み中...</div>}
                    error={<div>ページの読み込みに失敗しました。</div>}
                  />
                </Document>
              )}

              <div className="text-center mt-4">
                {numPages && (
                  <p className="text-gray-600">
                    ページ {currentPage} / {numPages}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;