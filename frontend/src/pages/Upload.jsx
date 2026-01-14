import { useState, useRef } from 'react'
import { uploadElectoralRoll } from '../services/api'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { motion, AnimatePresence } from 'framer-motion'
import { UploadCloud, File, CheckCircle2, AlertCircle, X, ChevronLeft, Home } from 'lucide-react'
import { cn } from '../lib/utils'
import { useNavigate, Link } from 'react-router-dom'

function Upload() {
  const navigate = useNavigate()
  const [files, setFiles] = useState([])
  const [state, setState] = useState('Andaman & Nicobar')
  const [uploading, setUploading] = useState(false)
  const [results, setResults] = useState(null)
  const [error, setError] = useState(null)
  const [activeDrag, setActiveDrag] = useState(false)

  // Preview State: { [filename]: { headers: [], rows: [] } }
  const [previews, setPreviews] = useState({})

  const fileInputRef = useRef(null)

  const handleDragEnter = (e) => {
    e.preventDefault()
    setActiveDrag(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setActiveDrag(false)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
  }

  const parseCSVPreview = (file) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      let text = e.target.result
      // Remove BOM if present
      if (text.charCodeAt(0) === 0xFEFF) {
        text = text.slice(1)
      }
      const lines = text.split('\n').filter(line => line.trim() !== '').slice(0, 6) // Header + 5 rows
      if (lines.length > 0) {
        const headers = lines[0].split(',').map(h => h.trim())
        const rows = lines.slice(1).map(line => line.split(',').map(c => c.trim()))

        setPreviews(prev => ({
          ...prev,
          [file.name]: { headers, rows }
        }))
      }
    }
    const blob = file.slice(0, 5120)
    reader.readAsText(blob)
  }

  const addFiles = (newFiles) => {
    const validFiles = Array.from(newFiles).filter(
      f => f.type === 'text/csv' || f.name.endsWith('.csv')
    )

    if (validFiles.length === 0) {
      setError('Please upload valid CSV files.')
      return
    }

    // Identify duplicates
    const currentNames = new Set(files.map(f => f.name))
    const uniqueFiles = validFiles.filter(f => !currentNames.has(f.name))

    if (uniqueFiles.length < validFiles.length) {
      setError('Some files were skipped because they are already added.')
    } else {
      setError(null)
    }

    setFiles(prev => [...prev, ...uniqueFiles])
    setResults(null)

    uniqueFiles.forEach(file => {
      parseCSVPreview(file)
    })
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setActiveDrag(false)
    addFiles(e.dataTransfer.files)
  }

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      addFiles(e.target.files)
    }
  }

  const removeFile = (fileNameToRemove) => {
    setFiles(prev => prev.filter(f => f.name !== fileNameToRemove))
    setPreviews(prev => {
      const newPreviews = { ...prev }
      delete newPreviews[fileNameToRemove]
      return newPreviews
    })
    setError(null)
    setResults(null)
    if (files.length <= 1 && fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (files.length === 0) {
      setError('Please select at least one file')
      return
    }

    setUploading(true)
    setError(null)
    try {
      const response = await uploadElectoralRoll(files, state)
      // Normalize response to array if single object returned (backward compatibility)
      const resArray = response.results ? response.results : [response]
      setResults(resArray)

      // If multiple files uploaded, navigate to DiffViewer for comparison
      // specifically check for exactly 2 files for pairwise comparison as per requirement
      // but passing all results is safer for future extensibility
      if (resArray.length >= 2) {
        // Short delay to let user see success state, then navigate
        setTimeout(() => {
          navigate('/diffviewer', { state: { uploads: resArray } })
        }, 1500)
      }

    } catch (err) {
      setError(err.message || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const resetUpload = () => {
    setFiles([])
    setPreviews({})
    setResults(null)
    setError(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <div className="min-h-screen bg-gray-50/50 p-8 flex items-center justify-center relative">
      {/* Navigation Buttons */}
      <div className="absolute top-8 left-8 flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="text-gray-500 hover:text-gray-900 gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </Button>
        <Link to="/">
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-500 hover:text-gray-900 gap-2"
          >
            <Home className="h-4 w-4" />
            Home
          </Button>
        </Link>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl"
      >
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Upload Electoral Roll</CardTitle>
            <CardDescription>Drag and drop CSV files here or click to browse. You can upload multiple files.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Select State / UT</label>
                <select
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full bg-white border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2.5"
                >
                  <option value="Andaman & Nicobar">Andaman & Nicobar</option>
                  <option value="Maharashtra">Maharashtra</option>
                  <option value="Delhi">Delhi</option>
                  <option value="Karnataka">Karnataka</option>
                  <option value="Uttar Pradesh">Uttar Pradesh</option>
                </select>
              </div>

              <AnimatePresence mode="wait">
                {files.length === 0 && !results ? (
                  <motion.div
                    key="dropzone"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className={cn(
                      "border-2 border-dashed rounded-xl p-12 text-center transition-all duration-200 cursor-pointer flex flex-col items-center justify-center gap-4",
                      activeDrag
                        ? "border-indigo-500 bg-indigo-50 scale-[1.02]"
                        : "border-gray-200 hover:border-indigo-400 hover:bg-gray-50"
                    )}
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept=".csv"
                      multiple
                      onChange={handleFileChange}
                    />
                    <div className="p-4 rounded-full bg-indigo-50 text-indigo-600">
                      <UploadCloud className="h-10 w-10" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Click to upload or drag and drop</p>
                      <p className="text-sm text-gray-500 mt-1">CSV files only (max 50MB)</p>
                    </div>
                  </motion.div>
                ) : !results ? (
                  <motion.div
                    key="file-preview-list"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-4"
                  >
                    {/* Compact Add More Area */}
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center cursor-pointer hover:bg-gray-50 hover:border-indigo-300 transition-colors"
                    >
                      <p className="text-sm text-gray-500 flex items-center justify-center gap-2">
                        <UploadCloud className="h-4 w-4" /> Add more files
                      </p>
                      <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept=".csv"
                        multiple
                        onChange={handleFileChange}
                      />
                    </div>

                    {files.map((file) => (
                      <div key={file.name} className="space-y-2">
                        <div className="border rounded-xl p-4 flex items-center gap-4 bg-white">
                          <div className="p-3 rounded-lg bg-indigo-100 text-indigo-600">
                            <File className="h-6 w-6" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 truncate">{file.name}</p>
                            <p className="text-sm text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeFile(file.name)}
                            disabled={uploading}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>

                        {previews[file.name] && (
                          <div className="border rounded-xl overflow-hidden bg-white text-xs">
                            <div className="bg-gray-50 px-4 py-1.5 border-b border-gray-200">
                              <span className="font-semibold text-gray-500 uppercase tracking-wider">Preview: {file.name}</span>
                            </div>
                            <div className="overflow-x-auto max-h-32">
                              <table className="w-full text-left">
                                <thead className="text-gray-700 bg-gray-50 sticky top-0">
                                  <tr>
                                    {previews[file.name].headers.map((h, i) => (
                                      <th key={i} className="px-4 py-2 whitespace-nowrap">{h}</th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody>
                                  {previews[file.name].rows.map((row, i) => (
                                    <tr key={i} className="border-b last:border-0 hover:bg-gray-50">
                                      {row.map((cell, j) => (
                                        <td key={j} className="px-4 py-1.5 whitespace-nowrap text-gray-600">{cell}</td>
                                      ))}
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </motion.div>
                ) : (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-4"
                  >
                    <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
                      <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                        <CheckCircle2 className="h-6 w-6 text-green-600" />
                      </div>
                      <h3 className="text-lg font-medium text-green-900">Upload Process Complete</h3>
                      <p className="text-sm text-green-700 mt-1">Processed {results.length} files.</p>
                    </div>

                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {results.map((res, idx) => (
                        <div key={idx} className={cn(
                          "p-3 rounded-lg border text-sm flex justify-between items-center",
                          res.error ? "bg-red-50 border-red-200 text-red-700" : "bg-white border-gray-200"
                        )}>
                          <span className="font-medium truncate max-w-[200px]">{res.filename}</span>
                          {res.error ? (
                            <span className="flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Failed</span>
                          ) : (
                            <span className="text-green-600 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> {res.row_count} rows</span>
                          )}
                        </div>
                      ))}
                    </div>

                    <Button
                      type="button"
                      className="mt-6 w-full"
                      onClick={resetUpload}
                    >
                      Upload More Files
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>

              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="bg-red-50 text-red-700 p-3 rounded-lg flex items-center gap-2 text-sm"
                >
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </motion.div>
              )}

              {files.length > 0 && !results && (
                <Button
                  type="submit"
                  className="w-full"
                  disabled={uploading}
                  size="lg"
                >
                  {uploading ? (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Processing {files.length} files...
                    </div>
                  ) : (
                    `Start Processing (${files.length} files)`
                  )}
                </Button>
              )}
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

export default Upload
