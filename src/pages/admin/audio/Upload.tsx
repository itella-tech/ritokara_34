import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminLayout from '@/components/layouts/AdminLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useFiles } from '@/hooks/useFiles'
import { useToast } from '@/components/ui/use-toast'

export default function AudioUpload() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const { uploadAudio } = useFiles()
  const [language, setLanguage] = useState('')
  const [file, setFile] = useState<File | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file || !language) return

    try {
      await uploadAudio.mutateAsync({
        file,
        language,
        pdfPageId: '1' // TODO: Add PDF page selection
      })
      toast({
        title: "Success",
        description: "Audio uploaded successfully",
      })
      navigate('/admin/audio')
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload audio",
        variant: "destructive"
      })
    }
  }

  return (
    <AdminLayout>
      <h1 className="text-3xl font-bold mb-8">Upload Audio</h1>
      <form onSubmit={handleSubmit} className="space-y-6 max-w-xl">
        <div className="space-y-2">
          <Label htmlFor="language">Language</Label>
          <Select value={language} onValueChange={setLanguage} required>
            <SelectTrigger>
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ja">Japanese</SelectItem>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="zh">Chinese</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="file">Audio File</Label>
          <Input
            id="file"
            type="file"
            accept="audio/*"
            onChange={(e) => setFile(e.files?.[0] || null)}
            required
          />
        </div>
        <Button type="submit" disabled={uploadAudio.isPending}>
          {uploadAudio.isPending ? "Uploading..." : "Upload Audio"}
        </Button>
      </form>
    </AdminLayout>
  )
}