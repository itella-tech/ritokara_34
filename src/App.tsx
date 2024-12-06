import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Index from './pages/Index'
import AdminPdfDetails from './pages/admin/pdf/[id]/details'
import AdminPdfIndex from './pages/admin/pdf/List'
import Header from './components/Header'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Header />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/admin/pdf/:id/details" element={<AdminPdfDetails />} />
          <Route path="/admin" element={<AdminPdfIndex />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App