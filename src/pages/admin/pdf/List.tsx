import { Link } from 'react-router-dom'
import AdminLayout from '@/components/layouts/AdminLayout'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useFiles } from '@/hooks/useFiles'
import { getFileUrl } from '@/lib/storage'

export default function PDFList() {
  const { getPDFFiles } = useFiles()
  const { data: pdfFiles } = getPDFFiles()

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">PDF Files</h1>
        <Link to="/admin/pdf/upload">
          <Button>Upload PDF</Button>
        </Link>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pdfFiles?.map((file) => (
            <TableRow key={file.id}>
              <TableCell>{file.title}</TableCell>
              <TableCell>{file.description}</TableCell>
              <TableCell>{new Date(file.created_at).toLocaleDateString()}</TableCell>
              <TableCell className="space-x-2">
                <Link to={`/admin/pdf/${file.id}/details`}>
                  <Button variant="outline" size="sm">Details</Button>
                </Link>
                <a 
                  href={getFileUrl('pdfs', file.file_path)} 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <Button variant="outline" size="sm">View</Button>
                </a>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </AdminLayout>
  )
}