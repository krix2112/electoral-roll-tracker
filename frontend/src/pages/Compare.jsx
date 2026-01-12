import { useState, useEffect } from 'react'
import { getUploads, compareRolls } from '../services/api'

function Compare() {
  const [uploads, setUploads] = useState([])
  const [oldId, setOldId] = useState('')
  const [newId, setNewId] = useState('')
  const [comparing, setComparing] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadUploads()
  }, [])

  const loadUploads = async () => {
    try {
      const data = await getUploads()
      setUploads(data)
    } catch (err) {
      setError('Failed to load uploads')
    }
  }

  const handleCompare = async (e) => {
    e.preventDefault()
    if (!oldId || !newId) {
      setError('Please select both rolls')
      return
    }
    if (oldId === newId) {
      setError('Please select different rolls')
      return
    }

    setComparing(true)
    setError(null)
    try {
      const data = await compareRolls(oldId, newId)
      setResult(data)
    } catch (err) {
      setError(err.message || 'Comparison failed')
    } finally {
      setComparing(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8">Compare Electoral Rolls</h1>
        <form onSubmit={handleCompare} className="bg-white p-6 rounded-lg shadow mb-6">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-2">Old Roll</label>
              <select
                value={oldId}
                onChange={(e) => setOldId(e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="">Select...</option>
                {uploads.map((upload) => (
                  <option key={upload.upload_id} value={upload.upload_id}>
                    {upload.filename} ({upload.row_count} records)
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">New Roll</label>
              <select
                value={newId}
                onChange={(e) => setNewId(e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="">Select...</option>
                {uploads.map((upload) => (
                  <option key={upload.upload_id} value={upload.upload_id}>
                    {upload.filename} ({upload.row_count} records)
                  </option>
                ))}
              </select>
            </div>
          </div>
          <button
            type="submit"
            disabled={comparing || !oldId || !newId}
            className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 disabled:opacity-50"
          >
            {comparing ? 'Comparing...' : 'Compare'}
          </button>
          {error && (
            <div className="mt-4 p-3 bg-red-100 text-red-700 rounded">
              {error}
            </div>
          )}
        </form>
        {result && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-bold mb-4">Comparison Results</h2>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="p-4 bg-green-100 rounded">
                <p className="font-bold">Added</p>
                <p className="text-2xl">{result.stats.total_added}</p>
              </div>
              <div className="p-4 bg-red-100 rounded">
                <p className="font-bold">Deleted</p>
                <p className="text-2xl">{result.stats.total_deleted}</p>
              </div>
              <div className="p-4 bg-yellow-100 rounded">
                <p className="font-bold">Modified</p>
                <p className="text-2xl">{result.stats.total_modified}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Compare
