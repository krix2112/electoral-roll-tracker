import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { uploadElectoralRoll, compareRolls } from '../services/api';
import { Navbar } from '../components/Navbar';

// LocalStorage keys for persistence
const ACTIVITY_STORAGE_KEY = 'matsetu_recent_activity';
const LAST_ANALYZED_KEY = 'matsetu_last_analyzed';
const UPLOADER_NAME_KEY = 'matsetu_uploader_name';

export default function Compare() {
  const navigate = useNavigate();
  const [baseFile, setBaseFile] = useState(null);
  const [compareFile, setCompareFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  // Activity tracking state
  const [recentActivity, setRecentActivity] = useState([]);
  const [lastAnalyzed, setLastAnalyzed] = useState(null);
  const [uploaderName, setUploaderName] = useState('');
  const [showNamePrompt, setShowNamePrompt] = useState(false);
  const [tempName, setTempName] = useState('');

  const baseInputRef = useRef(null);
  const compareInputRef = useRef(null);

  // Load persisted data on mount
  useEffect(() => {
    const savedActivity = localStorage.getItem(ACTIVITY_STORAGE_KEY);
    if (savedActivity) {
      try {
        setRecentActivity(JSON.parse(savedActivity));
      } catch (e) {
        console.error('Failed to parse activity from localStorage');
      }
    }

    const savedLastAnalyzed = localStorage.getItem(LAST_ANALYZED_KEY);
    if (savedLastAnalyzed) {
      try {
        setLastAnalyzed(JSON.parse(savedLastAnalyzed));
      } catch (e) {
        console.error('Failed to parse last analyzed from localStorage');
      }
    }

    const savedName = localStorage.getItem(UPLOADER_NAME_KEY);
    if (savedName) {
      setUploaderName(savedName);
    }
  }, []);

  // Persist activity to localStorage
  const addActivity = (activity) => {
    const newActivity = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      ...activity
    };
    const updatedActivity = [newActivity, ...recentActivity].slice(0, 10); // Keep last 10
    setRecentActivity(updatedActivity);
    localStorage.setItem(ACTIVITY_STORAGE_KEY, JSON.stringify(updatedActivity));
    return newActivity;
  };

  // Update last analyzed
  const updateLastAnalyzed = (data) => {
    const analyzedData = {
      timestamp: new Date().toISOString(),
      ...data
    };
    setLastAnalyzed(analyzedData);
    localStorage.setItem(LAST_ANALYZED_KEY, JSON.stringify(analyzedData));
  };

  // Format relative time
  const formatRelativeTime = (isoString) => {
    if (!isoString) return 'Never';
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  // Format timestamp for display
  const formatTimestamp = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  // Helper for file handling
  const handleFileSelect = (file, type) => {
    if (file && (file.type === 'text/csv' || file.name.endsWith('.csv'))) {
      // Check if we need uploader name
      if (!uploaderName) {
        setShowNamePrompt(true);
        // Store file selection to apply after name is set
        if (type === 'base') {
          sessionStorage.setItem('pendingBaseFile', 'true');
        } else {
          sessionStorage.setItem('pendingCompareFile', 'true');
        }
      }

      if (type === 'base') {
        setBaseFile(file);
        if (uploaderName) {
          addActivity({
            type: 'upload',
            action: `uploaded base roll`,
            fileName: file.name,
            user: uploaderName
          });
        }
      } else {
        setCompareFile(file);
        if (uploaderName) {
          addActivity({
            type: 'upload',
            action: `uploaded comparison roll`,
            fileName: file.name,
            user: uploaderName
          });
        }
      }
      setError(null);
    } else {
      setError('Please upload valid CSV files.');
    }
  };

  // Save uploader name
  const saveUploaderName = () => {
    if (tempName.trim()) {
      const name = tempName.trim();
      setUploaderName(name);
      localStorage.setItem(UPLOADER_NAME_KEY, name);
      setShowNamePrompt(false);
      setTempName('');

      // Add pending file activities
      if (baseFile && sessionStorage.getItem('pendingBaseFile')) {
        addActivity({
          type: 'upload',
          action: `uploaded base roll`,
          fileName: baseFile.name,
          user: name
        });
        sessionStorage.removeItem('pendingBaseFile');
      }
      if (compareFile && sessionStorage.getItem('pendingCompareFile')) {
        addActivity({
          type: 'upload',
          action: `uploaded comparison roll`,
          fileName: compareFile.name,
          user: name
        });
        sessionStorage.removeItem('pendingCompareFile');
      }
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
    // Validation: Both files required
    if (!baseFile || !compareFile) {
      setError('Both Base Roll and Comparison Roll are required.');
      return;
    }

    // Validation: Check uploader name
    if (!uploaderName) {
      setShowNamePrompt(true);
      return;
    }

    setUploading(true);
    setError(null);

    try {
      // Add activity for analysis start
      addActivity({
        type: 'analysis',
        action: 'initiated comparison analysis',
        user: uploaderName,
        files: [baseFile.name, compareFile.name]
      });

      // Upload files
      const filesToUpload = [baseFile, compareFile];
      const selectedState = "Andaman & Nicobar";

      const response = await uploadElectoralRoll(filesToUpload, selectedState);
      const resArray = response.results ? response.results : [response];

      if (resArray.length >= 2) {
        const baseUploadId = resArray[0].upload_id;
        const compareUploadId = resArray[1].upload_id;

        // Perform actual comparison
        let comparisonResult = null;
        try {
          comparisonResult = await compareRolls(baseUploadId, compareUploadId);

          // Update last analyzed on successful comparison
          updateLastAnalyzed({
            baseFile: baseFile.name,
            compareFile: compareFile.name,
            user: uploaderName,
            stats: comparisonResult.stats || {}
          });

          // Add activity for successful analysis
          addActivity({
            type: 'analysis_complete',
            action: 'completed comparison analysis',
            user: uploaderName,
            files: [baseFile.name, compareFile.name],
            results: {
              added: comparisonResult.stats?.total_added || 0,
              deleted: comparisonResult.stats?.total_deleted || 0
            }
          });
        } catch (compareErr) {
          console.warn('Comparison API error, proceeding to viewer:', compareErr);
          // Still proceed to diff viewer even if compare fails
          updateLastAnalyzed({
            baseFile: baseFile.name,
            compareFile: compareFile.name,
            user: uploaderName
          });
        }

        // Navigate to diff viewer with results
        navigate('/diffviewer', {
          state: {
            uploads: resArray,
            comparison: comparisonResult
          }
        });
      } else {
        setError('Upload successful but did not return expected data.');
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Analysis initiation failed.");

      // Add activity for failed analysis
      addActivity({
        type: 'error',
        action: 'analysis failed',
        user: uploaderName,
        error: err.message || "Unknown error"
      });
    } finally {
      setUploading(false);
    }
  };

  // Drag zone styling - consistent with app theme
  const dragZoneClass = "border-2 border-dashed border-gray-200 rounded-xl p-8 transition-all hover:border-indigo-400 hover:bg-indigo-50/50 cursor-pointer text-center";

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Name Prompt Modal */}
      {showNamePrompt && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100]">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Enter Your Name</h3>
            <p className="text-gray-500 mb-6">Your name will be associated with uploads and analysis actions.</p>
            <input
              type="text"
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              placeholder="Enter your name"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500 mb-4"
              onKeyDown={(e) => e.key === 'Enter' && saveUploaderName()}
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowNamePrompt(false)}
                className="flex-1 px-4 py-3 border border-gray-200 rounded-lg font-medium hover:bg-gray-50 transition-colors text-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={saveUploaderName}
                disabled={!tempName.trim()}
                className="flex-1 px-4 py-3 bg-indigo-700 text-white rounded-lg font-medium hover:bg-indigo-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <div className="container mx-auto px-4 pt-8 pb-4 text-center">
        <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
          <span className="material-symbols-outlined text-lg">compare_arrows</span>
          Roll Comparison Workspace
        </div>

        <h1 className="text-4xl md:text-5xl font-extrabold text-[#0f172a] mb-4 tracking-tight">
          Compare Electoral Rolls
        </h1>

        <p className="text-xl text-gray-500 mb-8 max-w-2xl mx-auto">
          Upload and compare two electoral rolls to identify additions, deletions, and modifications
        </p>

        {uploaderName && (
          <p className="text-sm text-gray-500 mb-4">
            Logged in as: <span className="font-semibold text-indigo-700">{uploaderName}</span>
          </p>
        )}
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 pb-16">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* Sidebar */}
          <aside className="w-full lg:w-72 flex-shrink-0 space-y-6">
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)]">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Workspace Info</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-[11px] text-gray-400 uppercase font-bold mb-1">Status</p>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    <span className="text-sm font-medium text-gray-900">Ready for Review</span>
                  </div>
                </div>
                <div>
                  <p className="text-[11px] text-gray-400 uppercase font-bold mb-1">Organization</p>
                  <p className="text-sm font-medium text-gray-900">Election Commission Unit</p>
                </div>
                <div>
                  <p className="text-[11px] text-gray-400 uppercase font-bold mb-1">Last Uploader</p>
                  <p className="text-sm font-medium text-indigo-600">{uploaderName || 'Not set'}</p>
                </div>
                <div>
                  <p className="text-[11px] text-gray-400 uppercase font-bold mb-1">Last Analyzed</p>
                  <p className="text-sm font-medium text-gray-900">
                    {lastAnalyzed ? formatRelativeTime(lastAnalyzed.timestamp) : 'Never'}
                  </p>
                  {lastAnalyzed && (
                    <p className="text-xs text-gray-500 mt-1">
                      {lastAnalyzed.baseFile} vs {lastAnalyzed.compareFile}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Recent Activity - Functional */}
            <div className="bg-[#f8fafc] rounded-2xl p-5 border border-gray-100">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Recent Activity</h3>
              <div className="space-y-4 max-h-64 overflow-y-auto">
                {recentActivity.length === 0 ? (
                  <p className="text-xs text-gray-500">No activity yet. Upload files to get started.</p>
                ) : (
                  recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3">
                      <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${activity.type === 'upload' ? 'bg-blue-500' :
                        activity.type === 'analysis' ? 'bg-indigo-500' :
                          activity.type === 'analysis_complete' ? 'bg-green-500' :
                            activity.type === 'error' ? 'bg-red-500' : 'bg-gray-400'
                        }`}></div>
                      <div className="flex-1">
                        <p className="text-xs text-gray-600 leading-relaxed">
                          <span className="font-semibold text-gray-900">{activity.user}</span>{' '}
                          {activity.action}
                          {activity.fileName && (
                            <span className="text-gray-500"> "{activity.fileName}"</span>
                          )}
                        </p>
                        <p className="text-[10px] text-gray-400 mt-0.5">
                          {formatTimestamp(activity.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </aside>

          {/* Content Area */}
          <div className="flex-1 space-y-6">

            {/* Upload Card */}
            <div className="bg-white p-8 rounded-2xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] border border-gray-100">

              {/* Error Message */}
              {error && (
                <div className="mb-6 p-4 rounded-xl bg-red-50 text-red-700 border border-red-200 flex items-center gap-2">
                  <span className="material-symbols-outlined">error</span>
                  <span>{error}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">

                {/* Base Context Zone */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-1 px-1">
                    <div className="flex items-center gap-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600 text-sm font-bold">1</span>
                      <label className="block text-sm font-bold uppercase tracking-wider text-gray-500">Base Context</label>
                    </div>
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Required</span>
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
                    <div className="flex flex-col items-center gap-4 py-4">
                      {baseFile ? (
                        <>
                          <div className="w-16 h-16 rounded-2xl bg-green-100 flex items-center justify-center text-green-600">
                            <span className="material-symbols-outlined text-4xl">check_circle</span>
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 text-lg">{baseFile.name}</p>
                            <p className="text-xs text-gray-500 mt-1 font-medium">{(baseFile.size / 1024).toFixed(1)} KB • Ready</p>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-400 hover:text-blue-600 hover:bg-blue-100 transition-colors">
                            <span className="material-symbols-outlined text-3xl">upload_file</span>
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 text-base">Upload Base Roll (File 1)</p>
                            <p className="text-xs text-gray-500 mt-1 font-medium">Select source file or drag here</p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Comparison Data Zone */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-1 px-1">
                    <div className="flex items-center gap-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-green-600 text-sm font-bold">2</span>
                      <label className="block text-sm font-bold uppercase tracking-wider text-gray-500">Comparison Data</label>
                    </div>
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Required</span>
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
                    <div className="flex flex-col items-center gap-4 py-4">
                      {compareFile ? (
                        <>
                          <div className="w-16 h-16 rounded-2xl bg-green-100 flex items-center justify-center text-green-600">
                            <span className="material-symbols-outlined text-4xl">check_circle</span>
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 text-lg">{compareFile.name}</p>
                            <p className="text-xs text-gray-500 mt-1 font-medium">{(compareFile.size / 1024).toFixed(1)} KB • Ready</p>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="w-16 h-16 rounded-2xl bg-green-50 flex items-center justify-center text-green-400 hover:text-green-600 hover:bg-green-100 transition-colors">
                            <span className="material-symbols-outlined text-3xl">description</span>
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 text-base">Upload Comparison Roll (File 2)</p>
                            <p className="text-xs text-gray-500 mt-1 font-medium">Select target file or drag here</p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

              </div>

              <button
                onClick={handleInitiateAnalysis}
                disabled={uploading || !baseFile || !compareFile}
                className={`w-full bg-indigo-700 hover:bg-indigo-800 text-white font-bold py-5 rounded-xl transition-all shadow-lg flex items-center justify-center gap-3 group text-lg ${(uploading || !baseFile || !compareFile) ? 'opacity-50 cursor-not-allowed' : ''}`}
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
        </div>
      </div>

      {/* Footer - Consistent with Home.jsx */}
      <footer className="bg-[#0f172a] text-white py-12 text-center">
        <img src="/assets/logo-new.png" alt="MatSetu" className="h-20 w-auto mx-auto mb-4" />
        <p className="font-semibold text-lg mb-2">Matsetu</p>
        <p className="text-gray-400 text-sm mb-8">Electoral Roll Forensic Audit System</p>
        <p className="text-gray-600 text-xs">© 2026 Matsetu. A project for ensuring electoral transparency and integrity.</p>
      </footer>

    </div>
  );
}
