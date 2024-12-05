import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminLayout from '@/components/layouts/AdminLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useFiles } from '@/hooks/useFiles'
import { useToast } from '@/components/ui/use-toast'

export default function PDFUpload() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const { uploadPDF } = useFiles()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [file, setFile] = useState<File | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file || !title) return

    try {
      await uploadPDF.mutateAsync({
        file,
        title,
        description
      })
      toast({
        title: "Success",
        description: "PDF uploaded successfully",
      })
      navigate('/admin/pdf')
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload PDF",
        variant: "destructive"
      })
    }
  }

  return (
    <AdminLayout>
      <h1 className="text-3xl font-bold mb-8">Upload PDF</h1>
      <form onSubmit={handleSubmit} className="space-y-6 max-w-xl">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="file">PDF File</Label>
          <Input
            id="file"
            type="file"
            accept=".pdf"
            onChange={(e) => setFile(e.files?.[0] || null)}
            required
          />
        </div>
        <Button type="submit" disabled={uploadPDF.isPending}>
          {uploadPDF.isPending ? "Uploading..." : "Upload PDF"}
        </Button>
      </form>
    </AdminLayout>
  )
}