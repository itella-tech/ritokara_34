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

export default function AudioList() {
  const { getAudioFiles } = useFiles()
  const { data: audioFiles } = getAudioFiles('')

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Audio Files</h1>
        <Link to="/admin/audio/upload">
          <Button>Upload Audio</Button>
        </Link>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Language</TableHead>
            <TableHead>PDF Page</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {audioFiles?.map((file) => (
            <TableRow key={file.id}>
              <TableCell>{file.language}</TableCell>
              <TableCell>{file.pdf_page_id}</TableCell>
              <TableCell>{new Date(file.created_at).toLocaleDateString()}</TableCell>
              <TableCell>
                <a 
                  href={getFileUrl('audio', file.file_path)} 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <Button variant="outline" size="sm">Play</Button>
                </a>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </AdminLayout>
  )
}