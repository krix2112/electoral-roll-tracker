import { useState, useEffect } from 'react'
import { getUploads } from '../services/api'

function Dashboard() {
  const [uploads, setUploads] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadUploads()
  }, [])

  const loadUploads = async () => {
    try {
      const data = await getUploads()
      setUploads(data)
    } catch (err) {
      console.error('Failed to load uploads:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p>Loading...</p>
    </div>
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left">Filename</th>
                <th className="px-6 py-3 text-left">Records</th>
                <th className="px-6 py-3 text-left">Uploaded At</th>
                <th className="px-6 py-3 text-left">Upload ID</th>
              </tr>
            </thead>
            <tbody>
              {uploads.map((upload) => (
                <tr key={upload.upload_id} className="border-t">
                  <td className="px-6 py-4">{upload.filename}</td>
                  <td className="px-6 py-4">{upload.row_count}</td>
                  <td className="px-6 py-4">{new Date(upload.uploaded_at).toLocaleString()}</td>
                  <td className="px-6 py-4 font-mono text-sm">{upload.upload_id}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {uploads.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              No uploads yet. Upload your first electoral roll to get started.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard
