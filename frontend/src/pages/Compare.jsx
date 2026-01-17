import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { uploadElectoralRoll, compareRolls } from '../services/api';
import { NewHeader } from '../components/home_redesign/NewHeader';
import { NewFooter } from '../components/home_redesign/NewFooter';

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
  const dragZoneClass = "group relative border-2 border-dashed border-gray-200 rounded-2xl p-8 transition-all duration-300 hover:border-[#FF6B4A]/50 hover:bg-orange-50/30 cursor-pointer text-center overflow-hidden";

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

      {/* Name Prompt Modal */}
      {showNamePrompt && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] border border-white/20 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#FF6B4A] to-[#2D3E8F]" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Enter Your Name</h3>
            <p className="text-gray-500 mb-8 text-sm">Your name will be associated with uploads and forensic analysis actions for audit trails.</p>

            <div className="space-y-4">
              <input
                type="text"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                placeholder="Ex. Officer Sharma"
                className="w-full px-5 py-4 border border-gray-200 bg-gray-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2D3E8F]/20 focus:border-[#2D3E8F] transition-all text-gray-800 placeholder:text-gray-400 font-medium"
                onKeyDown={(e) => e.key === 'Enter' && saveUploaderName()}
                autoFocus
              />
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowNamePrompt(false)}
                  className="flex-1 px-4 py-3 border border-gray-200 rounded-xl font-semibold hover:bg-gray-50 transition-colors text-gray-600 active:scale-95 duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={saveUploaderName}
                  disabled={!tempName.trim()}
                  className="flex-1 px-4 py-3 bg-[#2D3E8F] text-white rounded-xl font-semibold hover:bg-[#1e2a63] transition-all shadow-lg shadow-indigo-900/20 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 duration-200"
                >
                  Save Identity
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <div className="relative z-10 pt-32 pb-12 text-center container mx-auto px-4">
        <div className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-md border border-white/40 shadow-sm text-[#2D3E8F] px-4 py-1.5 rounded-full text-sm font-bold mb-6 animate-fade-in-up">
          <span className="w-2 h-2 rounded-full bg-[#FF6B4A] animate-pulse"></span>
          Roll Comparison Workspace
        </div>

        <h1 className="text-5xl md:text-6xl font-black text-[#0f172a] mb-6 tracking-tight leading-tight">
          Compare <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF6B4A] to-[#FF8F6B]">Electoral Rolls</span>
        </h1>

        <p className="text-lg md:text-xl text-gray-500 mb-8 max-w-2xl mx-auto leading-relaxed">
          Forensically analyze two electoral rolls to identify additions, deletions, and suspicious modifications with high precision.
        </p>

        {uploaderName && (
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur border border-gray-100 rounded-2xl shadow-sm text-sm text-gray-500">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#2D3E8F] to-[#4c5fd6] text-white flex items-center justify-center font-bold text-xs">
              {uploaderName.charAt(0).toUpperCase()}
            </div>
            <span>Logged in as <span className="font-bold text-gray-900">{uploaderName}</span></span>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 pb-24 relative z-10 flex-1">
        <div className="flex flex-col lg:flex-row gap-8 max-w-7xl mx-auto">

          {/* Sidebar */}
          <aside className="w-full lg:w-80 flex-shrink-0 space-y-6">

            {/* Workspace Info Card */}
            <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-6 border border-white/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-50 rounded-xl text-blue-600">
                  <span className="material-symbols-outlined text-xl">dataset</span>
                </div>
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Workspace Info</h3>
              </div>

              <div className="space-y-5">
                <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                  <span className="text-xs font-semibold text-gray-500 uppercase">Status</span>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 bg-green-50 text-green-700 rounded-lg text-xs font-bold ring-1 ring-green-100">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                    Ready
                  </div>
                </div>

                <div>
                  <p className="text-[10px] text-gray-400 uppercase font-bold mb-1.5">Organization</p>
                  <p className="text-sm font-semibold text-gray-900">Election Commission Unit</p>
                </div>

                <div>
                  <p className="text-[10px] text-gray-400 uppercase font-bold mb-1.5">Active Agent</p>
                  <p className="text-sm font-semibold text-[#2D3E8F]">{uploaderName || 'Not identified'}</p>
                </div>

                <div className="p-3 bg-gray-50/50 rounded-xl border border-gray-100">
                  <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">Last Analysis</p>
                  <p className="text-sm font-medium text-gray-900 leading-tight">
                    {lastAnalyzed ? formatRelativeTime(lastAnalyzed.timestamp) : 'No recent analysis'}
                  </p>
                  {lastAnalyzed && (
                    <p className="text-[11px] text-gray-500 mt-1 truncate">
                      {lastAnalyzed.baseFile} vs ...
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Recent Activity Card */}
            <div className="bg-white/50 backdrop-blur-md rounded-3xl p-6 border border-white/30">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">history</span> Recent Activity
              </h3>

              <div className="space-y-0 relative">
                {/* Timeline line */}
                <div className="absolute left-1.5 top-2 bottom-2 w-0.5 bg-gray-100 rounded-full"></div>

                {recentActivity.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-4 italic">No activity recorded yet.</p>
                ) : (
                  recentActivity.map((activity, idx) => (
                    <div key={activity.id} className="relative pl-6 pb-6 last:pb-0 group">
                      <div className={`absolute left-0 top-1.5 w-3.5 h-3.5 rounded-full border-2 border-white shadow-sm z-10 ${activity.type === 'upload' ? 'bg-blue-500' :
                          activity.type === 'analysis' ? 'bg-orange-500' :
                            activity.type === 'analysis_complete' ? 'bg-green-500' :
                              activity.type === 'error' ? 'bg-red-500' : 'bg-gray-400'
                        }`}></div>

                      <div className="bg-white/60 p-3 rounded-xl border border-white/50 hover:bg-white hover:shadow-sm transition-all duration-300">
                        <p className="text-xs text-gray-600 leading-relaxed font-medium">
                          <span className="text-[#0f172a] font-bold">{activity.user}</span>{' '}
                          {activity.action}
                        </p>
                        {activity.fileName && (
                          <div className="mt-1.5 flex items-center gap-1 text-[10px] text-gray-500 bg-white px-2 py-1 rounded border border-gray-100 w-fit">
                            <span className="material-symbols-outlined text-[10px]">description</span>
                            <span className="truncate max-w-[150px]">{activity.fileName}</span>
                          </div>
                        )}
                        <p className="text-[10px] text-gray-400 mt-2 font-medium">
                          {formatTimestamp(activity.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </aside>

          {/* Comparison Area */}
          <div className="flex-1">
            <div className="bg-white/80 backdrop-blur-xl p-8 md:p-10 rounded-[2.5rem] shadow-[0_20px_40px_-10px_rgba(0,0,0,0.05)] border border-white/60 relative overflow-hidden">

              {/* Decorative gradients inside card */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-orange-50 to-transparent opacity-50 rounded-bl-[100px] pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-blue-50 to-transparent opacity-50 rounded-tr-[100px] pointer-events-none" />

              {/* Error Message */}
              {error && (
                <div className="mb-8 p-4 rounded-2xl bg-red-50 text-red-700 border border-red-100 flex items-start gap-3 animate-shake">
                  <span className="material-symbols-outlined text-red-500 mt-0.5">error</span>
                  <div>
                    <h4 className="font-bold text-sm">Action Failed</h4>
                    <p className="text-sm opacity-90">{error}</p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10 mb-10 relative z-10">

                {/* Base Context Zone */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-2 px-2">
                    <div className="flex items-center gap-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#2D3E8F] text-white text-sm font-bold shadow-md shadow-blue-900/20">1</span>
                      <div>
                        <label className="block text-sm font-bold text-gray-800">Base Context</label>
                        <span className="text-[10px] text-gray-500 font-medium">Original Roll (e.g., 2024)</span>
                      </div>
                    </div>
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

                    {baseFile ? (
                      <div className="flex flex-col items-center gap-3 animate-fade-in py-2">
                        <div className="w-20 h-20 rounded-2xl bg-green-50 border border-green-100 flex items-center justify-center text-green-500 shadow-sm relative">
                          <span className="material-symbols-outlined text-4xl">check_circle</span>
                          <div className="absolute inset-0 bg-green-400/20 rounded-2xl blur-lg -z-10"></div>
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 text-lg truncate max-w-[200px]">{baseFile.name}</p>
                          <p className="text-xs text-gray-500 font-bold bg-gray-100 px-2 py-1 rounded-md inline-block mt-1">{(baseFile.size / 1024).toFixed(1)} KB</p>
                        </div>
                        <button
                          onClick={(e) => { e.stopPropagation(); setBaseFile(null); }}
                          className="text-xs text-red-500 hover:text-red-700 font-medium hover:underline mt-1"
                        >
                          Remove file
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-4 py-8 group-hover:scale-[1.02] transition-transform duration-300">
                        <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center text-[#2D3E8F] group-hover:bg-[#2D3E8F] group-hover:text-white transition-colors shadow-sm">
                          <span className="material-symbols-outlined text-3xl">upload_file</span>
                        </div>
                        <div>
                          <p className="font-bold text-gray-700 text-base">Click to Upload Base Roll</p>
                          <p className="text-xs text-gray-400 mt-1 font-medium">or drag CSV file here</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Comparison Data Zone */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-2 px-2">
                    <div className="flex items-center gap-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FF6B4A] text-white text-sm font-bold shadow-md shadow-orange-900/20">2</span>
                      <div>
                        <label className="block text-sm font-bold text-gray-800">Comparison Target</label>
                        <span className="text-[10px] text-gray-500 font-medium">New Roll (e.g., 2025)</span>
                      </div>
                    </div>
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

                    {compareFile ? (
                      <div className="flex flex-col items-center gap-3 animate-fade-in py-2">
                        <div className="w-20 h-20 rounded-2xl bg-green-50 border border-green-100 flex items-center justify-center text-green-500 shadow-sm relative">
                          <span className="material-symbols-outlined text-4xl">check_circle</span>
                          <div className="absolute inset-0 bg-green-400/20 rounded-2xl blur-lg -z-10"></div>
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 text-lg truncate max-w-[200px]">{compareFile.name}</p>
                          <p className="text-xs text-gray-500 font-bold bg-gray-100 px-2 py-1 rounded-md inline-block mt-1">{(compareFile.size / 1024).toFixed(1)} KB</p>
                        </div>
                        <button
                          onClick={(e) => { e.stopPropagation(); setCompareFile(null); }}
                          className="text-xs text-red-500 hover:text-red-700 font-medium hover:underline mt-1"
                        >
                          Remove file
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-4 py-8 group-hover:scale-[1.02] transition-transform duration-300">
                        <div className="w-16 h-16 rounded-2xl bg-orange-50 flex items-center justify-center text-[#FF6B4A] group-hover:bg-[#FF6B4A] group-hover:text-white transition-colors shadow-sm">
                          <span className="material-symbols-outlined text-3xl">difference</span>
                        </div>
                        <div>
                          <p className="font-bold text-gray-700 text-base">Click to Upload Target</p>
                          <p className="text-xs text-gray-400 mt-1 font-medium">or drag CSV file here</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

              </div>

              <button
                onClick={handleInitiateAnalysis}
                disabled={uploading || !baseFile || !compareFile}
                className={`w-full relative overflow-hidden bg-gradient-to-r from-[#2D3E8F] to-[#4c5fd6] hover:to-[#2D3E8F] text-white font-bold py-5 rounded-2xl transition-all shadow-[0_10px_30px_-5px_rgba(45,62,143,0.4)] hover:shadow-[0_20px_40px_-5px_rgba(45,62,143,0.6)] flex items-center justify-center gap-3 group text-lg transform hover:-translate-y-1 active:translate-y-0 disabled:transform-none disabled:shadow-none ${(uploading || !baseFile || !compareFile) ? 'opacity-50 cursor-not-allowed grayscale' : ''}`}
              >
                {/* Button shine effect */}
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer" />

                {uploading ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-2xl">refresh</span>
                    <span className="tracking-wide">Analyzing Electoral Data...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-2xl group-hover:rotate-12 transition-transform duration-300">analytics</span>
                    <span className="tracking-wide">Initiate Forensic Comparison</span>
                  </>
                )}
              </button>

              <p className="text-center text-xs text-gray-400 mt-4 font-medium">
                <span className="material-symbols-outlined text-[10px] align-middle mr-1">encrypted</span>
                Data is processed securely. Analysis may take up to 30 seconds depending on file size.
              </p>
            </div>


          </div>
        </div>
      </div>

      <NewFooter />
    </div>
  );
}
