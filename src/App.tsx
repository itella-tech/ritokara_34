import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Index from './pages/Index'
import AdminPdfDetails from './pages/admin/pdf/[id]/details'
import AdminPdfIndex from './pages/admin/pdf/List'
import ModelSettingsPage from './pages/admin/settings/ModelSettings'
import DictionarySettings from './pages/admin/settings/DictionarySettings'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/admin/pdf/:id/details" element={<AdminPdfDetails />} />
          <Route path="/admin" element={<AdminPdfIndex />} />
          <Route path="/admin/settings/models" element={<ModelSettingsPage />} />
          <Route path="/admin/settings/dictionary" element={<DictionarySettings />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App