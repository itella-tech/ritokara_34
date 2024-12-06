import { Link } from 'react-router-dom'
import { Home, FileText, Music } from 'lucide-react'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <div className="border-b">
        <div className="flex h-16 items-center px-4">
          <Link to="/admin" className="font-bold">Admin Dashboard</Link>
        </div>
      </div>
      <div className="flex">
        <div className="w-64 border-r min-h-[calc(100vh-4rem)]">
          <nav className="p-4 space-y-2">
            <Link 
              to="/admin" 
              className="flex items-center gap-2 p-2 hover:bg-accent rounded-md"
            >
              <Home className="w-4 h-4" />
              Dashboard
            </Link>
          </nav>
        </div>
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  )
}