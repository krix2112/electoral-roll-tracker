import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { uploadElectoralRoll } from '../services/api';

// Since we are not using the full tailwind config from the user snippet immediately,
// and we want to ensure compatibility, we stick to standard Tailwind classes where possible,
// or rely on arbitrary values. Ideally, we'd update tailwind.config.js, 
// but inline styles/classes work faster for this single-file injection without restarting build/config.
// However, I've added .matsetu-text to index.css.

export default function Upload() {
  const navigate = useNavigate();
  const [baseFile, setBaseFile] = useState(null);
  const [compareFile, setCompareFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const baseInputRef = useRef(null);
  const compareInputRef = useRef(null);

  // Helper for file handling
  const handleFileSelect = (file, type) => {
    if (file && (file.type === 'text/csv' || file.name.endsWith('.csv'))) {
      if (type === 'base') setBaseFile(file);
      else setCompareFile(file);
      setError(null);
    } else {
      setError('Please upload valid CSV files.');
    }
  };

  const onDrop = (e, type) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0], type);
      e.dataTransfer.clearData();
    }
  };

  const onDragOver = (e) => e.preventDefault();

  const handleInitiateAnalysis = async () => {
    if (!baseFile || !compareFile) {
      setError('Both Base Roll and Comparison Roll are required.');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      // Create array for existing API
      const filesToUpload = [baseFile, compareFile];
      // Hardcoded state for now as it wasn't in the new UI, default to Andaman or Generic
      const selectedState = "Andaman & Nicobar";

      const response = await uploadElectoralRoll(filesToUpload, selectedState);
      const resArray = response.results ? response.results : [response];

      if (resArray.length >= 2) {
        navigate('/diffviewer', { state: { uploads: resArray } });
      } else {
        setError('Upload successful but did not return expected data.');
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Analysis initiation failed.");
    } finally {
      setUploading(false);
    }
  };

  // Common classes
  const dragZoneClass = "border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-8 transition-all hover:border-blue-500 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer text-center";

  return (
    <div className="bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 min-h-screen flex flex-col transition-colors duration-200 font-sans">

      {/* Header */}
      <header className="w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 flex items-center justify-center">
              <span className="material-symbols-outlined text-4xl text-blue-500">search_insights</span>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900">
                <div className="w-1 h-1 bg-white rounded-full"></div>
              </div>
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-2xl font-bold matsetu-text">मतसेतु</span>
              <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-400">MatSetu</span>
            </div>
          </div>
          <div className="hidden md:flex items-center border-l border-slate-200 dark:border-slate-700 pl-6 gap-2">
            <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-blue-500 transition-colors">
              <span className="material-symbols-outlined text-lg">arrow_back</span>
              Back
            </button>
            <Link to="/">
              <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-blue-500 transition-colors">
                <span className="material-symbols-outlined text-lg">home</span>
                Home
              </button>
            </Link>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/">
            <button className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-blue-500 hover:bg-blue-600 rounded-lg transition-all shadow-sm">
              <span className="material-symbols-outlined text-lg">dashboard</span>
              Dashboard
            </button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1400px] mx-auto px-6 py-8 w-full flex flex-col md:flex-row gap-8">

        {/* Sidebar */}
        <aside className="w-full md:w-72 flex-shrink-0 space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Workspace Info</h3>
            <div className="space-y-4">
              <div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 uppercase font-bold mb-1">Status</p>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500"></span>
                  <span className="text-sm font-medium">Ready for Review</span>
                </div>
              </div>
              <div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 uppercase font-bold mb-1">Organization</p>
                <p className="text-sm font-medium">Election Commission Unit</p>
              </div>
              <div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 uppercase font-bold mb-1">Last Analyzed</p>
                <p className="text-sm font-medium">Recently</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-100 dark:bg-slate-800/50 rounded-2xl p-5 border border-transparent dark:border-slate-700">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Recent Activity</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-orange-500 mt-1.5"></div>
                <p className="text-xs text-slate-600 dark:text-slate-400"><span className="font-semibold text-slate-900 dark:text-slate-200">System</span> initialized workspace</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Content Area */}
        <div className="flex-1 space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="text-left">
              <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2 tracking-tight">MatSetu Comparison Workspace</h1>
              <p className="text-base text-slate-500 dark:text-slate-400 max-w-2xl">Prepare and compare electoral rolls with your team. Review changes and collaborate on data integrity.</p>
            </div>
            <div className="flex gap-2">
              {/* History button placeholder */}
              <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm">
                <span className="material-symbols-outlined text-lg">history</span>
                History
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-12 bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700">

              {/* Error Message */}
              {error && (
                <div className="mb-6 p-4 rounded-xl bg-red-50 text-red-600 border border-red-200 flex items-center gap-2">
                  <span className="material-symbols-outlined">error</span>
                  <span>{error}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">

                {/* Base Context Zone */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-500/10 text-orange-500 text-xs font-bold">1</span>
                      <label className="block text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Base Context</label>
                    </div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Required</span>
                  </div>

                  <div
                    className={dragZoneClass}
                    onDrop={(e) => onDrop(e, 'base')}
                    onDragOver={onDragOver}
                    onClick={() => baseInputRef.current?.click()}
                  >
                    <input
                      type="file"
                      ref={baseInputRef}
                      className="hidden"
                      accept=".csv"
                      onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0], 'base')}
                    />
                    <div className="flex flex-col items-center gap-3">
                      {baseFile ? (
                        <>
                          <div className="w-14 h-14 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-500">
                            <span className="material-symbols-outlined text-3xl">check_circle</span>
                          </div>
                          <div>
                            <p className="font-semibold text-slate-700 dark:text-slate-200">{baseFile.name}</p>
                            <p className="text-xs text-slate-400 mt-1">{(baseFile.size / 1024).toFixed(1)} KB • Ready</p>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-slate-400 hover:text-orange-500 hover:bg-orange-500/5 transition-colors">
                            <span className="material-symbols-outlined text-3xl">upload_file</span>
                          </div>
                          <div>
                            <p className="font-semibold text-slate-700 dark:text-slate-200">Upload Base Roll (File 1)</p>
                            <p className="text-xs text-slate-400 mt-1">Select source file or drag here</p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Comparison Data Zone */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500/10 text-green-500 text-xs font-bold">2</span>
                      <label className="block text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Comparison Data</label>
                    </div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Required</span>
                  </div>

                  <div
                    className={dragZoneClass}
                    onDrop={(e) => onDrop(e, 'compare')}
                    onDragOver={onDragOver}
                    onClick={() => compareInputRef.current?.click()}
                  >
                    <input
                      type="file"
                      ref={compareInputRef}
                      className="hidden"
                      accept=".csv"
                      onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0], 'compare')}
                    />
                    <div className="flex flex-col items-center gap-3">
                      {compareFile ? (
                        <>
                          <div className="w-14 h-14 rounded-2xl bg-green-50 flex items-center justify-center text-green-500">
                            <span className="material-symbols-outlined text-3xl">check_circle</span>
                          </div>
                          <div>
                            <p className="font-semibold text-slate-700 dark:text-slate-200">{compareFile.name}</p>
                            <p className="text-xs text-slate-400 mt-1">{(compareFile.size / 1024).toFixed(1)} KB • Ready</p>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-slate-400 hover:text-green-500 hover:bg-green-500/5 transition-colors">
                            <span className="material-symbols-outlined text-3xl">description</span>
                          </div>
                          <div>
                            <p className="font-semibold text-slate-700 dark:text-slate-200">Upload Comparison Roll (File 2)</p>
                            <p className="text-xs text-slate-400 mt-1">Select target file or drag here</p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

              </div>

              <button
                onClick={handleInitiateAnalysis}
                disabled={uploading}
                className={`w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-5 rounded-2xl transition-all shadow-xl shadow-blue-500/20 flex items-center justify-center gap-3 group text-lg ${uploading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {uploading ? (
                  <>
                    <span className="material-symbols-outlined animate-spin">refresh</span>
                    Processing Analysis...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined group-hover:rotate-180 transition-transform duration-500">analytics</span>
                    Initiate Analysis
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="pt-8 text-center bg-slate-50 dark:bg-slate-800/30 rounded-3xl p-8 border border-slate-100 dark:border-slate-800">
            <p className="text-slate-500 dark:text-slate-400 mb-5 font-medium">Ready for in-depth anomaly detection?</p>
            <Link
              to="/diffviewer"
              className="inline-flex items-center gap-3 px-8 py-4 font-semibold text-blue-500 hover:text-blue-700 dark:hover:text-blue-400 transition-all bg-white dark:bg-slate-800 border-2 border-blue-500/10 rounded-full hover:bg-blue-500/5 hover:border-blue-500/30 shadow-sm"
            >
              <span className="material-symbols-outlined">difference</span>
              Go to Diff Viewer
              <span className="material-symbols-outlined text-base">arrow_forward</span>
            </Link>
          </div>
        </div>
      </main>

      <footer className="mt-auto py-12 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="max-w-[1400px] mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col items-center md:items-start gap-2">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold matsetu-text">मतसेतु</span>
              <span className="text-[10px] uppercase font-bold text-slate-400">MatSetu</span>
            </div>
            <div className="text-sm text-slate-400">
              © 2024 MatSetu Digital Workspace. All rights reserved.
            </div>
          </div>
          <div className="flex gap-8 text-sm font-medium text-slate-500 dark:text-slate-400">
            <a href="#" className="hover:text-orange-500 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-green-500 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-blue-500 transition-colors">Help Center</a>
          </div>
        </div>
      </footer>

      <div className="fixed bottom-6 right-6">
        <button
          className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xl text-slate-600 dark:text-slate-400 hover:scale-110 transition-all active:scale-95"
          onClick={() => document.documentElement.classList.toggle('dark')}
        >
          <span className="material-symbols-outlined block dark:hidden">dark_mode</span>
          <span className="material-symbols-outlined hidden dark:block">light_mode</span>
        </button>
      </div>

    </div>
  );
}
