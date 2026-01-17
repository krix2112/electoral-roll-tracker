import { useState, useRef } from 'react'
import { uploadElectoralRoll } from '../services/api'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { motion, AnimatePresence } from 'framer-motion'
import { UploadCloud, File, CheckCircle2, AlertCircle, X, ChevronLeft, Home } from 'lucide-react'
import { cn } from '../lib/utils'
import { useNavigate, Link } from 'react-router-dom'
import { NewHeader } from '../components/home_redesign/NewHeader'

function Upload() {
  const navigate = useNavigate()
  const [files, setFiles] = useState([])
  const [state, setState] = useState('All States')
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
    <div className="min-h-screen bg-white relative overflow-hidden flex flex-col">
      {/* Background Decorations */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 -left-40 w-[500px] h-[500px] bg-[#FF6B4A]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 -right-40 w-[600px] h-[600px] bg-[#2D3E8F]/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-br from-orange-50/30 to-blue-50/30 rounded-full opacity-50" />
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `linear-gradient(rgba(0,0,0,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.015) 1px, transparent 1px)`,
            backgroundSize: '32px 32px'
          }}
        />
      </div>

      <NewHeader />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl relative z-10 mx-auto px-4 pt-32 pb-12 flex-1 flex flex-col justify-center"
      >
        <Card className="w-full bg-white/70 backdrop-blur-xl border-white/50 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.1)] rounded-3xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-gray-50/50 to-white/50 border-b border-gray-100 p-8">
            <div className="flex items-center gap-4 mb-2">
              <div className="w-12 h-12 rounded-2xl bg-[#2D3E8F]/10 flex items-center justify-center text-[#2D3E8F]">
                <UploadCloud className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold text-gray-900">Upload Electoral Roll</CardTitle>
                <CardDescription className="text-gray-500 font-medium">Drag and drop CSV files here or click to browse.</CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-8">

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Select Jurisdiction</label>
                <div className="relative">
                  <select
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full bg-gray-50/50 border border-gray-200 text-gray-800 text-sm rounded-xl focus:ring-2 focus:ring-[#2D3E8F]/20 focus:border-[#2D3E8F] block p-4 font-semibold appearance-none cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    <option value="All States">All States / National</option>
                    <option value="Andaman & Nicobar Islands">Andaman & Nicobar Islands</option>
                    <option value="Andhra Pradesh">Andhra Pradesh</option>
                    <option value="Delhi">Delhi</option>
                    <option value="Karnataka">Karnataka</option>
                    <option value="Maharashtra">Maharashtra</option>
                    <option value="Uttar Pradesh">Uttar Pradesh</option>
                    <option value="West Bengal">West Bengal</option>
                    {/* Add more states as needed */}
                  </select>
                  <div className="absolute right-4 top-4 pointer-events-none text-gray-400">
                    <ChevronLeft className="h-5 w-5 -rotate-90" />
                  </div>
                </div>
              </div>

              <AnimatePresence mode="wait">
                {files.length === 0 && !results ? (
                  <motion.div
                    key="dropzone"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className={cn(
                      "border-2 border-dashed rounded-2xl p-16 text-center transition-all duration-300 cursor-pointer flex flex-col items-center justify-center gap-5 group",
                      activeDrag
                        ? "border-[#FF6B4A] bg-[#FF6B4A]/5 scale-[1.02]"
                        : "border-gray-200 hover:border-[#FF6B4A]/50 hover:bg-orange-50/30"
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
                    <div className="p-5 rounded-2xl bg-indigo-50 text-[#2D3E8F] group-hover:scale-110 transition-transform duration-300 group-hover:bg-[#2D3E8F] group-hover:text-white shadow-sm">
                      <UploadCloud className="h-10 w-10" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-lg group-hover:text-[#FF6B4A] transition-colors">Click to upload or drag and drop</p>
                      <p className="text-sm text-gray-400 mt-1 font-medium">CSV files only (max 50MB)</p>
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
                      className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center cursor-pointer hover:bg-gray-50 hover:border-indigo-300 transition-all group"
                    >
                      <p className="text-sm font-semibold text-gray-500 flex items-center justify-center gap-2 group-hover:text-[#2D3E8F]">
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
                        <div className="border border-gray-100 rounded-2xl p-4 flex items-center gap-4 bg-white/60 shadow-sm hover:shadow-md transition-shadow">
                          <div className="p-3 rounded-xl bg-indigo-50 text-[#2D3E8F]">
                            <File className="h-6 w-6" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-gray-900 truncate">{file.name}</p>
                            <p className="text-xs text-gray-500 font-medium">{(file.size / 1024).toFixed(2)} KB</p>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeFile(file.name)}
                            disabled={uploading}
                            className="bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-700 rounded-lg h-9 w-9"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>

                        {previews[file.name] && (
                          <div className="border border-gray-100 rounded-xl overflow-hidden bg-white/40 text-xs shadow-inner">
                            <div className="bg-gray-50/80 px-4 py-2 border-b border-gray-100">
                              <span className="font-bold text-gray-400 uppercase tracking-wider text-[10px]">Preview: {file.name}</span>
                            </div>
                            <div className="overflow-x-auto max-h-32 scrollbar-hide">
                              <table className="w-full text-left">
                                <thead className="text-gray-700 bg-white/50 sticky top-0 backdrop-blur-sm">
                                  <tr>
                                    {previews[file.name].headers.map((h, i) => (
                                      <th key={i} className="px-4 py-2 whitespace-nowrap font-semibold">{h}</th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody>
                                  {previews[file.name].rows.map((row, i) => (
                                    <tr key={i} className="border-b border-gray-50 last:border-0 hover:bg-blue-50/30">
                                      {row.map((cell, j) => (
                                        <td key={j} className="px-4 py-1.5 whitespace-nowrap text-gray-600 font-medium">{cell}</td>
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
                    className="space-y-6"
                  >
                    <div className="bg-green-50/50 border border-green-100 rounded-3xl p-8 text-center relative overflow-hidden">
                      <div className="absolute inset-0 bg-green-100/30 blur-2xl"></div>
                      <div className="relative">
                        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4 shadow-sm text-green-600">
                          <CheckCircle2 className="h-8 w-8" />
                        </div>
                        <h3 className="text-xl font-bold text-green-900">Upload Complete</h3>
                        <p className="text-sm text-green-700 mt-1 font-medium">Successfully processed {results.length} files.</p>
                      </div>
                    </div>

                    <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                      {results.map((res, idx) => (
                        <div key={idx} className={cn(
                          "p-4 rounded-xl border text-sm flex justify-between items-center shadow-sm",
                          res.error ? "bg-red-50 border-red-100 text-red-700" : "bg-white border-gray-100"
                        )}>
                          <span className="font-bold truncate max-w-[200px]">{res.filename}</span>
                          {res.error ? (
                            <span className="flex items-center gap-1.5 font-semibold bg-red-100 px-2 py-1 rounded-lg text-xs"><AlertCircle className="w-3 h-3" /> Failed</span>
                          ) : (
                            <span className="text-green-600 flex items-center gap-1.5 font-semibold bg-green-50 px-2 py-1 rounded-lg text-xs"><CheckCircle2 className="w-3 h-3" /> {res.row_count} rows</span>
                          )}
                        </div>
                      ))}
                    </div>

                    <Button
                      type="button"
                      className="mt-6 w-full bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 py-6 rounded-xl font-bold shadow-sm"
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
                  className="bg-red-50 border border-red-100 text-red-700 p-4 rounded-xl flex items-center gap-3 text-sm font-medium animate-shake"
                >
                  <AlertCircle className="h-5 w-5 flex-shrink-0" />
                  {error}
                </motion.div>
              )}

              {files.length > 0 && !results && (
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-[#2D3E8F] to-[#4c5fd6] hover:to-[#2D3E8F] text-white font-bold py-6 rounded-xl shadow-lg shadow-indigo-500/30 text-lg transition-all transform active:scale-95 duration-200"
                  disabled={uploading}
                  size="lg"
                >
                  {uploading ? (
                    <div className="flex items-center gap-3">
                      <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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
