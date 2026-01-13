import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Upload from './pages/Upload'
import Compare from './pages/Compare'
import Dashboard from './pages/Dashboard'
import DiffViewer from './pages/DiffViewer';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/upload" element={<Upload />} />
        <Route path="/compare" element={<Compare />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/diffviewer" element={<DiffViewer />} />
      </Routes>
    </Router>
  )
}

export default App
