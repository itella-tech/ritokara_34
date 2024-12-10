import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PdfFile } from '@/types/pdf';
import { supabase } from '@/lib/supabaseClient';
import AdminLayout from '@/components/layouts/AdminLayout';

const AdminPdfIndex = () => {
  const [pdfs, setPdfs] = useState<PdfFile[]>([]);

  useEffect(() => {
    fetchPdfs();
  }, []);

  const fetchPdfs = async () => {
    const { data, error } = await supabase
      .from('pdf_files')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching PDFs:', error);
      return;
    }

    setPdfs(data || []);
  };

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">PDF一覧</h1>
      <div className="grid gap-4">
        {pdfs.map((pdf) => (
          <Link
            key={pdf.id}
            to={`/admin/pdf/${pdf.id}/details`}
            className="block bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <h2 className="text-xl font-semibold text-gray-900">{pdf.title}</h2>
            {pdf.description && (
              <p className="text-gray-600 mt-2">{pdf.description}</p>
            )}
          </Link>
        ))}
      </div>
    </AdminLayout>
  );
};

export default AdminPdfIndex;