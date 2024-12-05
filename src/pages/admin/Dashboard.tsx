import AdminLayout from '@/components/layouts/AdminLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useFiles } from '@/hooks/useFiles'

export default function AdminDashboard() {
  const { getPDFFiles } = useFiles()
  const { data: pdfFiles } = getPDFFiles()

  return (
    <AdminLayout>
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Total PDFs</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{pdfFiles?.length || 0}</p>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}