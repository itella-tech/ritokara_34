import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Index from './pages/Index'
import AdminDashboard from './pages/admin/Dashboard'
import PDFList from './pages/admin/pdf/List'
import PDFUpload from './pages/admin/pdf/Upload'
import AudioList from './pages/admin/audio/List'
import AudioUpload from './pages/admin/audio/Upload'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/pdf" element={<PDFList />} />
        <Route path="/admin/pdf/upload" element={<PDFUpload />} />
        <Route path="/admin/audio" element={<AudioList />} />
        <Route path="/admin/audio/upload" element={<AudioUpload />} />
      </Routes>
    </Router>
  )
}

export default App