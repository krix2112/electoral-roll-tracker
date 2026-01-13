import { useState, useRef } from 'react'
import { uploadElectoralRoll } from '../services/api'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { motion, AnimatePresence } from 'framer-motion'
import { UploadCloud, File, CheckCircle2, AlertCircle, X } from 'lucide-react'
import { cn } from '../lib/utils'

function Upload() {
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [activeDrag, setActiveDrag] = useState(false)

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

  const handleDrop = (e) => {
    e.preventDefault()
    setActiveDrag(false)
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile && droppedFile.type === 'text/csv' || droppedFile.name.endsWith('.csv')) {
      setFile(droppedFile)
      setError(null)
      setResult(null)
    } else {
      setError('Please upload a valid CSV file.')
    }
  }

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile) {
      setFile(selectedFile)
      setError(null)
      setResult(null)
    }
  }

  const removeFile = () => {
    setFile(null)
    setError(null)
    setResult(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!file) {
      setError('Please select a file')
      return
    }

    setUploading(true)
    setError(null)
    try {
      const response = await uploadElectoralRoll(file)
      setResult(response)
    } catch (err) {
      setError(err.message || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50/50 p-8 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-xl"
      >
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Upload Electoral Roll</CardTitle>
            <CardDescription>Drag and drop your CSV file here or click to browse.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">

              <AnimatePresence mode="wait">
                {!file && !result ? (
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
                ) : !result ? (
                  <motion.div
                    key="file-preview"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="border rounded-xl p-4 flex items-center gap-4 bg-white"
                  >
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
                      onClick={removeFile}
                      disabled={uploading}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-green-50 border border-green-200 rounded-xl p-6 text-center"
                  >
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                      <CheckCircle2 className="h-6 w-6 text-green-600" />
                    </div>
                    <h3 className="text-lg font-medium text-green-900">Upload Successful!</h3>
                    <div className="mt-2 text-sm text-green-700">
                      <p>Upload ID: <span className="font-mono">{result.upload_id}</span></p>
                      <p>Processed {result.row_count} rows successfully.</p>
                    </div>
                    <Button
                      type="button"
                      className="mt-6 w-full"
                      onClick={removeFile}
                    >
                      Upload Another File
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

              {file && !result && (
                <Button
                  type="submit"
                  className="w-full"
                  disabled={uploading}
                  size="lg"
                >
                  {uploading ? (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Processing...
                    </div>
                  ) : (
                    'Start Processing'
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
